import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { EntityFilter } from "@/components/entity-filter";
import { getCurrentUser, isSuperAdmin, selectedEntityFilter } from "@/lib/entityAccess";

type EtisalatBillPageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EtisalatBillPage({ searchParams }: EtisalatBillPageProps) {
	const token = (await cookies()).get("token")?.value;

	if (!token) {
		redirect("/login");
	}

	const currentUser = await getCurrentUser();

	if (!currentUser) {
		redirect("/login");
	}

	const resolvedSearchParams = searchParams ? await searchParams : {};
	const selectedEntity = typeof resolvedSearchParams.entity === "string" ? resolvedSearchParams.entity : undefined;
	const superAdmin = isSuperAdmin(currentUser);
	const entityOptions = superAdmin
		? (await prisma.user.findMany({
				distinct: ["entity"],
				select: { entity: true },
				orderBy: { entity: "asc" },
			})).map((user) => user.entity)
		: [];

	const usersWithCompanyNumbers = await prisma.user.findMany({
		where: {
			company_number: { not: null },
			...selectedEntityFilter(currentUser, selectedEntity),
		},
		select: {
			id: true,
			name: true,
			company_number: true,
			image_link: true,
			entity: true,
		},
		orderBy: [
			{ entity: "asc" },
			{ name: "asc" },
		],
	});

	const groupedUsers = usersWithCompanyNumbers.reduce<Map<string, typeof usersWithCompanyNumbers>>((groups, user) => {
		const entityUsers = groups.get(user.entity) ?? [];
		entityUsers.push(user);
		groups.set(user.entity, entityUsers);
		return groups;
	}, new Map());

	return (
		<main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-500">Etisalat Bills</p>
					<h1 className="mt-3 text-3xl font-semibold text-slate-900">Company numbers</h1>
					<p className="mt-2 text-sm text-slate-600">Users registered with a company number, grouped by entity.</p>
				</div>
				{superAdmin && <EntityFilter entities={entityOptions} selectedEntity={selectedEntity || ""} />}
			</div>

			{groupedUsers.size === 0 ? (
				<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
					{superAdmin && !selectedEntity
						? "Select an entity to view company numbers."
						: "No users with company numbers were found for this entity."}
				</div>
			) : (
				<div className="space-y-8">
					{Array.from(groupedUsers.entries()).map(([entity, users]) => (
						<section key={entity} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
							<div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Entity</p>
									<h2 className="mt-1 text-xl font-semibold text-slate-900">{entity}</h2>
								</div>
								<span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
									{users.length} {users.length === 1 ? "user" : "users"}
								</span>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full min-w-[540px] text-left text-sm">
									<thead className="border-b border-slate-100 text-xs uppercase tracking-[0.16em] text-slate-500">
										<tr>
											<th className="px-6 py-4 font-semibold">Profile</th>
											<th className="px-6 py-4 font-semibold">User ID</th>
											<th className="px-6 py-4 font-semibold">Name</th>
											<th className="px-6 py-4 font-semibold">Contact number</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
										{users.map((user) => (
											<tr key={user.id} className="transition hover:bg-sky-50/50">
												<td className="px-6 py-3">
													<Image
														src={user.image_link}
														alt={`${user.name}'s profile`}
														width={40}
														height={40}
														className="size-10 rounded-full object-cover"
													/>
												</td>
												<td className="px-6 py-4 font-medium text-slate-500">{user.id}</td>
												<td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
												{user.company_number && (
													<td className="px-6 py-4 text-slate-600">{user.company_number}</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</section>
					))}
				</div>
			)}
		</main>
	);
}
