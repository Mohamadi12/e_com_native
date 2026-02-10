import { useQuery } from "@tanstack/react-query";
import { customerApi } from "../lib/api";
import { formatDate } from "../lib/utils";

const CustomersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerApi.getAll,
  });

  const customers = data?.customers || [];

  return (
    <div className="spacey-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-base-content/70 mt-1">
          {customers.length} {customers.length === 1 ? "client" : "clients"}{" "}
          inscrit(s)
        </p>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p className="text-xl font-semibold mb-2">
                Aucun client pour le moment
              </p>
              <p className="text-sm">
                Les clients apparaîtront ici après leur inscription
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Email</th>
                    <th>Adresses</th>
                    <th>Favoris</th>
                    <th>Date d’inscription</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-12">
                            <img
                              src={customer.imageUrl}
                              alt={customer.name}
                              className="w-12 h-12 rounded-full"
                            />
                          </div>
                        </div>
                        <div className="font-semibold">{customer.name}</div>
                      </td>

                      <td>{customer.email}</td>

                      <td>
                        <div className="badge badge-ghost">
                          {customer.addresses?.length || 0} adresse(s)
                        </div>
                      </td>

                      <td>
                        <div className="badge badge-ghost">
                          {customer.wishlist?.length || 0} favoris
                        </div>
                      </td>

                      <td>
                        <span className="text-sm opacity-60">
                          {formatDate(customer.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
