import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/_redux/store";
import { creditAction } from "@/_redux/actions/credit.action";
import toast from "react-hot-toast";

export function useAdminCredit() {
	const dispatch = useAppDispatch();

	const adminMetrics = useAppSelector((state) => state.credit.adminMetrics);
	const customers = useAppSelector((state) => state.credit.customers);
	const paymentNotifications = useAppSelector((state) => state.credit.paymentNotifications);
	const loading = useAppSelector((state) => state.credit.loading);
	const error = useAppSelector((state) => state.credit.error);
	const pagination = useAppSelector((state) => state.credit.pagination);

	const fetchAdminMetrics = useCallback(async () => {
		dispatch({ type: "credit/setLoading", payload: true });
		try {
			const result = await dispatch(creditAction.fetchAdminMetricsAsync());
			if (creditAction.fetchAdminMetricsAsync.fulfilled.match(result)) {
				dispatch({ type: "credit/setAdminMetrics", payload: result.payload });
			} else {
				toast.error(result.payload as string);
			}
		} catch (err) {
			toast.error("Failed to fetch metrics");
		} finally {
			dispatch({ type: "credit/setLoading", payload: false });
		}
	}, [dispatch]);

	const fetchCustomers = useCallback(
		async (page = 1, limit = 10, search = "") => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(
					creditAction.fetchCreditCustomersAsync({ page, limit, search })
				);
				if (creditAction.fetchCreditCustomersAsync.fulfilled.match(result)) {
					dispatch({ type: "credit/setCustomers", payload: result.payload?.items || [] });
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
				toast.error("Failed to fetch customers");
			} finally {
				dispatch({ type: "credit/setLoading", payload: false });
			}
		},
		[dispatch]
	);

	const updateCreditAccount = useCallback(
		async (customerId: string, data: any) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.updateCreditAccountAsync({ customerId, data }));
				if (creditAction.updateCreditAccountAsync.fulfilled.match(result)) {
					toast.success("Credit account updated successfully!");
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

	const suspendCreditAccount = useCallback(
		async (customerId: string) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.suspendCreditAccountAsync(customerId));
				if (creditAction.suspendCreditAccountAsync.fulfilled.match(result)) {
					toast.success("Account suspended successfully!");
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

	const verifyPayment = useCallback(
		async (notificationId: string, data?: { verificationNotes?: string }) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.verifyPaymentAsync({ notificationId, data }));
				if (creditAction.verifyPaymentAsync.fulfilled.match(result)) {
					toast.success("Payment verified successfully!");
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

	const rejectPayment = useCallback(
		async (notificationId: string, reason: string) => {
			dispatch({ type: "credit/setLoading", payload: true });
			try {
				const result = await dispatch(creditAction.rejectPaymentAsync({ notificationId, reason }));
				if (creditAction.rejectPaymentAsync.fulfilled.match(result)) {
					toast.success("Payment rejected successfully!");
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

	return {
		adminMetrics,
		customers,
		paymentNotifications,
		loading,
		error,
		pagination,
		fetchAdminMetrics,
		fetchCustomers,
		updateCreditAccount,
		suspendCreditAccount,
		verifyPayment,
		rejectPayment,
	};
}
