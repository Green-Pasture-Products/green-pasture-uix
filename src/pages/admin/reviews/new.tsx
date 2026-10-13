import { useRouter } from "next/router";
import withAdminAuth from "@/_components/withAdminAuth";
import AdminLayout from "@/_components/AdminLayout";
import { TestimonialForm } from "@/_components/TestimonialForm";
import { BackButton } from "@/_UI/DetailField";

const NewTestimonial = () => {
	const router = useRouter();
	const back = () => router.push("/admin/reviews");
	return (
		<AdminLayout pageTitle="New testimonial">
			<div className="mx-auto w-full max-w-3xl space-y-6">
				<BackButton onClick={back} label="Back to Reviews" />
				<h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
					New testimonial
				</h1>
				<TestimonialForm onCancel={back} onSaved={back} />
			</div>
		</AdminLayout>
	);
};

export default withAdminAuth(NewTestimonial);
