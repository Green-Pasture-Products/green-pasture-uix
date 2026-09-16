import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { creditAction } from "@/_redux/actions/credit.action";
import toast from "react-hot-toast";

export function useCredit() {
	const dispatch = useAppDispatch();

	const creditAccount = useAppSelector((state) => state.credit.creditAccount);
	const transactions = useAppSelector((state) => state.credit.transactions);
	const paymentNotifications = useAppSelector((state) => state.credit.paymentNotifications);
	const loading = useAppSelector((state) => state.credit.loading);
	const error = useAppSelector((state) => state.credit.error);
	const pagination = useAppSelector((state) => state.credit.pagination);

	const fetchCreditAccount = useCallback(async () => {
		dispatch({ type: "credit/setLoading", payload: true });
		try {
			const result = await dispatch(creditAction.fetchCreditAccountAsync());
			if (creditAction.fetchCreditAccountAsync.fulfilled.match(result)) {
				dispatch({ type: "credit/setCreditAccount", payload: result.payload });
			} else {
				toast.error(result.payload as string);
			}
		} catch (err) {
			toast.error("Failed to fetch credit account");
		} finally {
			dispatch({ type: "credit/setLoading", payload: false });
		}
	}, [dispatch]);

	const fetchTransactions = useCallback(
		async (page = 1, limit = 10) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.fetchTransactionsAsync({ page, limit }));
				if (creditAction.fetchTransactionsAsync.fulfilled.match(result)) {
					dispatch({ type: "credit/setTransactions", payload: result.payload?.items || [] });
					dispatch({
						type: "credit/setPagination",
						payload: {
							currentPage: result.payload?.meta?.page || page,
							totalPages: result.payload?.meta?.pageCount || 1,
							limit,
						},
					});
				} else {
					toast.error(result.payload as string);
				}
			} catch (err) {
				toast.error("Failed to fetch transactions");
			} finally {
				dispatch({ type: "credit/setLoading", payload: false });
			}
		},
		[dispatch]
	);

	const submitPaymentNotification = useCallback(
		async (data: {
			paymentAmount: number;
			paymentDate: string;
			paymentMethod: string;
			transactionReference?: string;
			proofOfPaymentUrl?: string;
		}) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.submitPaymentNotificationAsync(data));
				if (creditAction.submitPaymentNotificationAsync.fulfilled.match(result)) {
					toast.success("Payment submitted successfully!");
					return result.payload;
				} else {
					toast.error(result.payload as string);
					throw new Error(result.payload as string);
				}
			} catch (err) {
				throw err;
			} finally {
				dispatch({ type: "credit/setLoading", payload: false });
			}
		},
		[dispatch]
	);

	const fetchPaymentNotifications = useCallback(
		async (page = 1, limit = 10) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(
					creditAction.fetchPaymentNotificationsAsync({ page, limit })
				);
				if (creditAction.fetchPaymentNotificationsAsync.fulfilled.match(result)) {
					dispatch({
						type: "credit/setPaymentNotifications",
						payload: result.payload?.items || [],
					});
				} else {
					toast.error(result.payload as string);
				}
			} catch (err) {
				toast.error("Failed to fetch payment notifications");
			} finally {
				dispatch({ type: "credit/setLoading", payload: false });
			}
		},
		[dispatch]
	);

	return {
		creditAccount,
		transactions,
		paymentNotifications,
		loading,
		error,
		pagination,
		fetchCreditAccount,
		fetchTransactions,
		submitPaymentNotification,
		fetchPaymentNotifications,
	};
}
