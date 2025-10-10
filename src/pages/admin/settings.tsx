import React, { useState } from "react";
import { useSelector } from "react-redux";
// import { RootState } from "../../../store";
// import AdminLayout from "../../../components/admin/AdminLayout";
import {
	User,
	Mail,
	Phone,
	MapPin,
	CreditCard,
	Bell,
	Shield,
	Globe,
	Save,
} from "lucide-react";
import { useAppSelector } from "@/_redux/store";
import AdminLayout from "@/_components/AdminLayout";

const AdminSettings: React.FC = () => {
	const { user } = useAppSelector((state) => state.admin);
	const [activeTab, setActiveTab] = useState("general");
	const [settings, setSettings] = useState({
		storeName: "OrganicStore",
		storeEmail: "hello@organicstore.com",
		storePhone: "(555) 123-4567",
		storeAddress: "1234 Organic Street, Green City, GC 12345",
		currency: "USD",
		taxRate: "8.0",
		freeShippingThreshold: "50.00",
		emailNotifications: true,
		smsNotifications: false,
		orderNotifications: true,
		lowStockAlerts: true,
	});

	const tabs = [
		{ id: "general", name: "General", icon: Globe },
		{ id: "notifications", name: "Notifications", icon: Bell },
		{ id: "payment", name: "Payment", icon: CreditCard },
		{ id: "security", name: "Security", icon: Shield },
	];

	const handleSave = () => {
		// Mock save functionality
		alert("Settings saved successfully!");
	};

	const handleInputChange = (key: string, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<AdminLayout>
			<div className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Tabs */}
					<div className="lg:col-span-1">
						<nav className="space-y-1">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										activeTab === tab.id
											? "bg-green-100 text-green-700 border-r-2 border-green-500"
											: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
									}`}
								>
									<tab.icon className="mr-3 h-5 w-5" />
									{tab.name}
								</button>
							))}
						</nav>
					</div>

					{/* Content */}
					<div className="lg:col-span-3">
						<div className="bg-white rounded-lg shadow-sm border border-gray-200">
							{activeTab === "general" && (
								<div className="p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-6">
										General Settings
									</h3>
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Store Name
											</label>
											<input
												type="text"
												value={settings.storeName}
												onChange={(e) =>
													handleInputChange(
														"storeName",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Store Email
											</label>
											<input
												type="email"
												value={settings.storeEmail}
												onChange={(e) =>
													handleInputChange(
														"storeEmail",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Store Phone
											</label>
											<input
												type="tel"
												value={settings.storePhone}
												onChange={(e) =>
													handleInputChange(
														"storePhone",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Store Address
											</label>
											<textarea
												rows={3}
												value={settings.storeAddress}
												onChange={(e) =>
													handleInputChange(
														"storeAddress",
														e.target.value
													)
												}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
											/>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Currency
												</label>
												<select
													value={settings.currency}
													onChange={(e) =>
														handleInputChange(
															"currency",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												>
													<option value="USD">USD ($)</option>
													<option value="EUR">EUR (€)</option>
													<option value="GBP">GBP (£)</option>
												</select>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Tax Rate (%)
												</label>
												<input
													type="number"
													step="0.1"
													value={settings.taxRate}
													onChange={(e) =>
														handleInputChange(
															"taxRate",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-2">
													Free Shipping Threshold ($)
												</label>
												<input
													type="number"
													step="0.01"
													value={settings.freeShippingThreshold}
													onChange={(e) =>
														handleInputChange(
															"freeShippingThreshold",
															e.target.value
														)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												/>
											</div>
										</div>
									</div>
								</div>
							)}

							{activeTab === "notifications" && (
								<div className="p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-6">
										Notification Settings
									</h3>
									<div className="space-y-6">
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Email Notifications
												</h4>
												<p className="text-sm text-gray-500">
													Receive notifications via email
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={settings.emailNotifications}
													onChange={(e) =>
														handleInputChange(
															"emailNotifications",
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
											</label>
										</div>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													SMS Notifications
												</h4>
												<p className="text-sm text-gray-500">
													Receive notifications via SMS
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={settings.smsNotifications}
													onChange={(e) =>
														handleInputChange(
															"smsNotifications",
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
											</label>
										</div>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Order Notifications
												</h4>
												<p className="text-sm text-gray-500">
													Get notified about new orders
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={settings.orderNotifications}
													onChange={(e) =>
														handleInputChange(
															"orderNotifications",
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
											</label>
										</div>
										<div className="flex items-center justify-between">
											<div>
												<h4 className="text-sm font-medium text-gray-900">
													Low Stock Alerts
												</h4>
												<p className="text-sm text-gray-500">
													Alert when products are running low
												</p>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={settings.lowStockAlerts}
													onChange={(e) =>
														handleInputChange(
															"lowStockAlerts",
															e.target.checked
														)
													}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
											</label>
										</div>
									</div>
								</div>
							)}

							{activeTab === "payment" && (
								<div className="p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-6">
										Payment Settings
									</h3>
									<div className="space-y-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="p-4 border border-gray-200 rounded-lg">
												<div className="flex items-center justify-between mb-3">
													<h4 className="font-medium text-gray-900">
														Stripe
													</h4>
													<span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
														Active
													</span>
												</div>
												<p className="text-sm text-gray-500 mb-3">
													Accept credit cards and digital payments
												</p>
												<button className="text-sm text-green-600 hover:text-green-700 font-medium">
													Configure
												</button>
											</div>
											<div className="p-4 border border-gray-200 rounded-lg">
												<div className="flex items-center justify-between mb-3">
													<h4 className="font-medium text-gray-900">
														PayPal
													</h4>
													<span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
														Inactive
													</span>
												</div>
												<p className="text-sm text-gray-500 mb-3">
													Accept PayPal payments
												</p>
												<button className="text-sm text-green-600 hover:text-green-700 font-medium">
													Enable
												</button>
											</div>
										</div>
									</div>
								</div>
							)}

							{activeTab === "security" && (
								<div className="p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-6">
										Security Settings
									</h3>
									<div className="space-y-6">
										<div>
											<h4 className="text-sm font-medium text-gray-900 mb-3">
												Change Password
											</h4>
											<div className="space-y-4 max-w-md">
												<input
													type="password"
													placeholder="Current password"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												/>
												<input
													type="password"
													placeholder="New password"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												/>
												<input
													type="password"
													placeholder="Confirm new password"
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
												/>
												<button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
													Update Password
												</button>
											</div>
										</div>
										<div>
											<h4 className="text-sm font-medium text-gray-900 mb-3">
												Two-Factor Authentication
											</h4>
											<p className="text-sm text-gray-500 mb-3">
												Add an extra layer of security to your
												account
											</p>
											<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
												Enable 2FA
											</button>
										</div>
									</div>
								</div>
							)}

							<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
								<button
									onClick={handleSave}
									className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
								>
									<Save className="h-4 w-4 mr-2" />
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</AdminLayout>
	);
};

export default AdminSettings;
