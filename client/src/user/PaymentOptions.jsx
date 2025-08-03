import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentOptions = () => {
    const navigate = useNavigate();
    const [paymentOptions, setPaymentOptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [monthlyDue, setMonthlyDue] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('UPI');

    useEffect(() => {
        fetchPaymentOptions();
        fetchMonthlyDue();
    }, []);

    const fetchPaymentOptions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/payments/payment-options', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setPaymentOptions(data);
        } catch (error) {
            console.error('Error fetching payment options:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyDue = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/payments/monthly-due', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setMonthlyDue(data);
            }
        } catch (error) {
            console.error('Error fetching monthly due:', error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment options...</p>
                </div>
            </div>
        );
    }

    if (!monthlyDue) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Payment Due</h2>
                    <p className="text-gray-600 mb-4">You don't have any pending payments for this month.</p>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Options</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Payment Details</h3>
                            <p><strong>Amount Due:</strong> ₹{monthlyDue.payment.amount?.toLocaleString('en-IN')}</p>
                            <p><strong>Month:</strong> {monthlyDue.payment.month} {monthlyDue.payment.year}</p>
                            <p><strong>Property:</strong> {monthlyDue.tenant.propertyName}</p>
                            <p><strong>Owner:</strong> {monthlyDue.tenant.ownerName}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tenant Details</h3>
                            <p><strong>Name:</strong> {monthlyDue.tenant.name}</p>
                            <p><strong>Apartment:</strong> {monthlyDue.tenant.apartmentNumber}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Payment Method</h2>
                    <div className="flex space-x-4 mb-6">
                        {paymentOptions?.paymentMethods.map((method) => (
                            <button
                                key={method}
                                onClick={() => setSelectedMethod(method)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedMethod === method
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}>
                                {method}
                            </button>
                        ))}
                    </div>

                    {/* UPI Payment */}
                    {selectedMethod === 'UPI' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Pay via UPI</h3>
                                <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto">
                                    <img
                                        src={`${paymentOptions.qrCode}${monthlyDue.payment.amount}`}
                                        alt="QR Code"
                                        className="mx-auto mb-4 border-2 border-gray-300 rounded-lg"
                                    />
                                    <p className="text-sm text-gray-600 mb-2">Scan QR code with any UPI app</p>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="font-semibold">UPI ID:</span>
                                        <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                                            {paymentOptions.upiId}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(paymentOptions.upiId)}
                                            className="text-blue-600 hover:text-blue-800 text-sm">
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bank Transfer */}
                    {selectedMethod === 'Bank Transfer' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Bank Transfer Details</h3>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p><strong>Bank Name:</strong> {paymentOptions.bankDetails.bankName}</p>
                                            <p><strong>Account Holder:</strong> {paymentOptions.bankDetails.accountHolderName}</p>
                                            <p><strong>Branch:</strong> {paymentOptions.bankDetails.branch}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span><strong>Account Number:</strong></span>
                                                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                                                    {paymentOptions.bankDetails.accountNumber}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(paymentOptions.bankDetails.accountNumber)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm">
                                                    Copy
                                                </button>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span><strong>IFSC Code:</strong></span>
                                                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                                                    {paymentOptions.bankDetails.ifscCode}
                                                </span>
                                                <button
                                                    onClick={() => copyToClipboard(paymentOptions.bankDetails.ifscCode)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm">
                                                    Copy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Important:</strong> Please include your apartment number as reference when making the transfer.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card Payment */}
                    {selectedMethod === 'Card Payment' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Card Payment</h3>
                                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                                    <p className="text-gray-600 mb-4">
                                        For card payments, please contact the property manager or use the online payment gateway.
                                    </p>
                                    <button
                                        onClick={() => window.open('https://razorpay.com', '_blank')}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                        Pay Online
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Instructions</h2>
                    <div className="space-y-3 text-gray-700">
                        <p>• Please make the payment before the 5th of each month to avoid late fees.</p>
                        <p>• Keep the payment receipt for your records.</p>
                        <p>• For any payment-related queries, contact your property manager.</p>
                        <p>• Payment confirmation will be sent to your registered email address.</p>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentOptions; 