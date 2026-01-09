'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProAuth } from '@/context/ProAuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCash, HiOutlineCreditCard, HiOutlineArrowUp, HiOutlineArrowDown, HiOutlineX, HiOutlineClock, HiOutlineExclamation, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import { FaCar } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface WalletData {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  reservation_id?: number;
  table_reservation_id?: number;
  car_booking_id?: number;
  balance_before?: number;
  balance_after?: number;
  metadata?: {
    booking_id?: number;
    car?: string;
    customer?: string;
    pickup_date?: string;
    return_date?: string;
    rental_days?: number;
    total_amount?: number;
    commission_rate?: number;
    commission_amount?: number;
    net_amount?: number;
  };
  car_booking?: {
    id: number;
    customer_name: string;
    customer_phone: string;
    pickup_date: string;
    return_date: string;
    rental_days: number;
    total_amount: number;
    car?: {
      brand: string;
      model: string;
      plate_number: string;
    };
  };
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  bank_name?: string;
  account_number?: string;
  created_at: string;
  processed_at?: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { hotelOwner, hotel, restaurantOwner, restaurant, companyOwner, company, loading, businessType } = useProAuth();
  const t = useTranslations('proWallet');
  const [wallet, setWallet] = useState<WalletData>({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions');
  const [commissionRate, setCommissionRate] = useState(10);
  const [expandedTx, setExpandedTx] = useState<number | null>(null);

  const isHotel = businessType === 'hotel';
  const isRestaurant = businessType === 'restaurant';
  const isCarRental = businessType === 'car_rental';
  const hasOwner = isHotel ? hotelOwner : isRestaurant ? restaurantOwner : isCarRental ? companyOwner : null;
  const hasBusiness = isHotel ? hotel : isRestaurant ? restaurant : isCarRental ? company : null;
  const apiPrefix = isHotel ? '/hotel-owner' : isCarRental ? '/company-owner' : '/restaurant-owner';
  const themeColor = isHotel ? '#2FB7EC' : isCarRental ? '#22C55E' : '#F97316';
  const createPath = isHotel ? '/pro/hotel/create' : isCarRental ? '/pro/company/create' : '/pro/restaurant/create';

  useEffect(() => {
    if (!loading && !hasOwner) {
      router.push('/pro/login');
    }
    if (!loading && !hasBusiness) {
      router.push(createPath);
    }
    if (hasBusiness) {
      fetchWalletData();
    }
  }, [loading, hasOwner, hasBusiness, router]);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('pro_token');

      // Fetch wallet balance
      const walletResponse = await api.get(`${apiPrefix}/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallet(walletResponse.data.wallet || walletResponse.data || {
        available_balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
      });
      if (walletResponse.data.commission_rate) {
        setCommissionRate(walletResponse.data.commission_rate);
      }

      // Fetch transactions
      const transactionsResponse = await api.get(`${apiPrefix}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txData = transactionsResponse.data;
      if (Array.isArray(txData)) {
        setTransactions(txData);
      } else if (txData?.transactions && Array.isArray(txData.transactions)) {
        setTransactions(txData.transactions);
      } else if (txData?.data && Array.isArray(txData.data)) {
        setTransactions(txData.data);
      } else {
        setTransactions([]);
      }

      // Fetch withdrawal requests
      const withdrawalsResponse = await api.get(`${apiPrefix}/wallet/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wdData = withdrawalsResponse.data;
      if (Array.isArray(wdData)) {
        setWithdrawalRequests(wdData);
      } else if (wdData?.withdrawals && Array.isArray(wdData.withdrawals)) {
        setWithdrawalRequests(wdData.withdrawals);
      } else if (wdData?.data && Array.isArray(wdData.data)) {
        setWithdrawalRequests(wdData.data);
      } else {
        setWithdrawalRequests([]);
      }

    } catch (err) {
      console.error('Failed to fetch wallet data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t('enterValidAmount'));
      return;
    }
    if (amount > wallet.available_balance) {
      toast.error(t('insufficientBalance'));
      return;
    }
    if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
      toast.error(t('fillBankDetails'));
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('pro_token');
      await api.post(`${apiPrefix}/wallet/withdraw`, {
        amount,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('withdrawalSubmitted'));
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setBankName('');
      setAccountNumber('');
      setAccountHolderName('');
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('withdrawalFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'booking_credit':
      case 'earning':
        return <HiOutlineArrowDown className="text-green-500" size={20} />;
      case 'withdrawal':
        return <HiOutlineArrowUp className="text-red-500" size={20} />;
      case 'refund':
        return <HiOutlineArrowUp className="text-orange-500" size={20} />;
      case 'balance_release':
        return <HiOutlineArrowDown className="text-blue-500" size={20} />;
      case 'commission_deduction':
        return <HiOutlineArrowUp className="text-purple-500" size={20} />;
      default:
        return <HiOutlineCash className="text-gray-500" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      approved: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const isCredit = (type: string) => {
    return ['booking_credit', 'earning', 'balance_release'].includes(type);
  };

  // Helper to translate transaction description
  const getTranslatedDescription = (transaction: Transaction) => {
    const desc = transaction.description || '';

    // Pattern: "Reservation #17 - zakaria amrani (after 10% commission)"
    const reservationMatch = desc.match(/Reservation #(\d+) - (.+?) \(after (\d+)% commission\)/i);
    if (reservationMatch) {
      return t('transactionDescriptions.reservationEarning', {
        id: reservationMatch[1],
        customer: reservationMatch[2],
        rate: reservationMatch[3]
      });
    }

    // Pattern: "Table reservation #5 - Customer Name"
    const tableMatch = desc.match(/Table reservation #(\d+) - (.+)/i);
    if (tableMatch) {
      return t('transactionDescriptions.tableReservationEarning', {
        id: tableMatch[1],
        customer: tableMatch[2]
      });
    }

    // Pattern: "Car booking #3 - Customer Name"
    const carMatch = desc.match(/Car booking #(\d+) - (.+)/i);
    if (carMatch) {
      return t('transactionDescriptions.carBookingEarning', {
        id: carMatch[1],
        customer: carMatch[2]
      });
    }

    // Pattern: "Balance released after checkout"
    if (desc.toLowerCase().includes('balance released after checkout')) {
      return t('transactionDescriptions.balanceReleased');
    }

    // Pattern: "Booking #16 payment received"
    const bookingPaymentMatch = desc.match(/Booking #(\d+) payment received/i);
    if (bookingPaymentMatch) {
      return t('transactionDescriptions.bookingPaymentReceived', { id: bookingPaymentMatch[1] });
    }

    // Pattern: "Commission deducted by platform"
    if (desc.toLowerCase().includes('commission deducted')) {
      return t('transactionDescriptions.commissionDeducted');
    }

    // Pattern: "Withdrawal completed"
    if (desc.toLowerCase().includes('withdrawal completed')) {
      return t('transactionDescriptions.withdrawalCompleted');
    }

    // Pattern: "Reservation #5 refund"
    const refundMatch = desc.match(/Reservation #(\d+) refund/i);
    if (refundMatch) {
      return t('transactionDescriptions.reservationRefund', { id: refundMatch[1] });
    }

    // Pattern: "Room booking #5 - Customer Name"
    const roomBookingMatch = desc.match(/Room booking #(\d+) - (.+)/i);
    if (roomBookingMatch) {
      return t('transactionDescriptions.roomBookingEarning', {
        id: roomBookingMatch[1],
        customer: roomBookingMatch[2]
      });
    }

    // Return original if no pattern matches
    return desc;
  };

  // Helper to translate withdrawal status
  const getTranslatedWithdrawalStatus = (status: string) => {
    const statusKey = status.toLowerCase();
    if (['pending', 'completed', 'approved', 'rejected'].includes(statusKey)) {
      return t(`withdrawalStatuses.${statusKey}`);
    }
    return status;
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: themeColor }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/pro/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
              <HiOutlineArrowLeft size={20} className="rtl:rotate-180" />
              {t('dashboard')}
            </Link>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                <HiOutlineCash size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-900">{t('wallet')}</span>
            </div>
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={wallet.available_balance <= 0}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor }}
          >
            <HiOutlineCreditCard size={18} />
            {t('withdraw')}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <HiOutlineCash size={20} className="text-green-600" />
              </div>
              <span className="text-sm text-gray-500">{t('available')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{wallet.available_balance?.toLocaleString()} DZD</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                <HiOutlineClock size={20} className="text-yellow-600" />
              </div>
              <span className="text-sm text-gray-500">{t('pending')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{wallet.pending_balance?.toLocaleString()} DZD</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <HiOutlineArrowDown size={20} className="text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">{t('totalEarned')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{wallet.total_earned?.toLocaleString()} DZD</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <HiOutlineArrowUp size={20} className="text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">{t('withdrawn')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{wallet.total_withdrawn?.toLocaleString()} DZD</p>
          </div>
        </div>

        {/* Commission Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <HiOutlineExclamation size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{t('platformCommission')}</p>
              <p className="text-xs text-gray-500">{t('commissionDesc', { rate: commissionRate })}</p>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: themeColor }}>{commissionRate}%</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
            style={activeTab === 'transactions' ? { backgroundColor: themeColor } : {}}
          >
            {t('transactions')}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'withdrawals'
                ? 'text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
            style={activeTab === 'withdrawals' ? { backgroundColor: themeColor } : {}}
          >
            {t('withdrawalRequests')}
          </button>
        </div>

        {/* Transactions List */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCash size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noTransactions')}</h3>
                <p className="text-gray-500">{t('noTransactionsDesc')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((transaction) => {
                  const isExpanded = expandedTx === transaction.id;
                  const hasDetails = transaction.metadata || transaction.car_booking || transaction.balance_before !== undefined;

                  return (
                    <div key={transaction.id} className="transition-colors">
                      {/* Main Row */}
                      <div
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                        onClick={() => hasDetails && setExpandedTx(isExpanded ? null : transaction.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{getTranslatedDescription(transaction)}</p>
                              <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-bold ${isCredit(transaction.type) ? 'text-green-600' : 'text-red-600'}`}>
                                {isCredit(transaction.type) ? '+' : ''}{Number(transaction.amount)?.toLocaleString()} DZD
                              </p>
                            </div>
                            {hasDetails && (
                              <div className="text-gray-400">
                                {isExpanded ? <HiOutlineChevronUp size={20} /> : <HiOutlineChevronDown size={20} />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && hasDetails && (
                        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                          <div className="ml-14 grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                            {/* Booking Info */}
                            {(transaction.metadata?.booking_id || transaction.car_booking_id) && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('bookingId')}</p>
                                <p className="font-medium text-gray-900">#{transaction.metadata?.booking_id || transaction.car_booking_id}</p>
                              </div>
                            )}

                            {/* Car Info */}
                            {(transaction.metadata?.car || transaction.car_booking?.car) && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('vehicle')}</p>
                                <div className="flex items-center gap-2">
                                  <FaCar className="text-gray-400" size={14} />
                                  <p className="font-medium text-gray-900">
                                    {transaction.metadata?.car || `${transaction.car_booking?.car?.brand} ${transaction.car_booking?.car?.model}`}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Customer */}
                            {(transaction.metadata?.customer || transaction.car_booking?.customer_name) && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('customer')}</p>
                                <p className="font-medium text-gray-900">{transaction.metadata?.customer || transaction.car_booking?.customer_name}</p>
                              </div>
                            )}

                            {/* Rental Period */}
                            {(transaction.metadata?.pickup_date || transaction.car_booking?.pickup_date) && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('rentalPeriod')}</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(transaction.metadata?.pickup_date || transaction.car_booking?.pickup_date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(transaction.metadata?.return_date || transaction.car_booking?.return_date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            )}

                            {/* Rental Days */}
                            {(transaction.metadata?.rental_days || transaction.car_booking?.rental_days) && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('duration')}</p>
                                <p className="font-medium text-gray-900">{transaction.metadata?.rental_days || transaction.car_booking?.rental_days} {t('days')}</p>
                              </div>
                            )}

                            {/* Total Amount (before commission) */}
                            {transaction.metadata?.total_amount && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('grossAmount')}</p>
                                <p className="font-medium text-gray-900">{Number(transaction.metadata.total_amount).toLocaleString()} DZD</p>
                              </div>
                            )}

                            {/* Commission */}
                            {transaction.metadata?.commission_rate && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('commission')} ({transaction.metadata.commission_rate}%)</p>
                                <p className="font-medium text-red-500">-{Number(transaction.metadata.commission_amount).toLocaleString()} DZD</p>
                              </div>
                            )}

                            {/* Net Amount */}
                            {transaction.metadata?.net_amount && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('netAmount')}</p>
                                <p className="font-medium text-green-600">+{Number(transaction.metadata.net_amount).toLocaleString()} DZD</p>
                              </div>
                            )}

                            {/* Balance Before/After */}
                            {transaction.balance_before !== undefined && transaction.balance_before !== null && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('balanceBefore')}</p>
                                <p className="font-medium text-gray-900">{Number(transaction.balance_before).toLocaleString()} DZD</p>
                              </div>
                            )}
                            {transaction.balance_after !== undefined && transaction.balance_after !== null && (
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">{t('balanceAfter')}</p>
                                <p className="font-medium text-gray-900">{Number(transaction.balance_after).toLocaleString()} DZD</p>
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Withdrawal Requests List */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {withdrawalRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineCreditCard size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noWithdrawals')}</h3>
                <p className="text-gray-500">{t('noWithdrawalsDesc')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {withdrawalRequests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                          <HiOutlineCreditCard size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t('withdrawTo', { bank: request.bank_name })}</p>
                          <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
                          {request.account_number && (
                            <p className="text-sm text-gray-400">{t('account')}: ***{request.account_number.slice(-4)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="font-bold text-gray-900">{request.amount?.toLocaleString()} DZD</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                          {getTranslatedWithdrawalStatus(request.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('withdrawFunds')}</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX size={20} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="p-4 space-y-3">
              {/* Available Balance Info */}
              <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('available')}</span>
                <span className="text-lg font-bold" style={{ color: themeColor }}>{wallet.available_balance?.toLocaleString()} DZD</span>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('amountDzd')}</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={wallet.available_balance}
                  min={1000}
                  step={100}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': themeColor } as any}
                  placeholder={t('minAmount')}
                  required
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('bank')}</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  required
                >
                  <option value="">{t('selectBank')}</option>
                  <option value="BNA">BNA</option>
                  <option value="CPA">CPA</option>
                  <option value="BEA">BEA</option>
                  <option value="BADR">BADR</option>
                  <option value="BDL">BDL</option>
                  <option value="CNEP">CNEP</option>
                  <option value="Gulf Bank">Gulf Bank</option>
                  <option value="Societe Generale">Société Générale</option>
                  <option value="AGB">AGB</option>
                  <option value="Baraka Bank">Al Baraka</option>
                  <option value="CCP">CCP</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('ribNumber')}</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder={t('enterRib')}
                  required
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('accountHolder')}</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                  placeholder={t('nameOnAccount')}
                  required
                />
              </div>

              {/* Notice */}
              <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg">
                {t('processingTime')}
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                {submitting ? t('processing') : t('requestWithdrawal')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
