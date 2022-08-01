import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import constants from "../constants";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}
interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
}
interface formProps {
  user: User;
  products: Product[];
}
interface quantityProps {
  product_id: number;
  quantity: number;
  price: number;
}

export default function Home() {
  const router = useRouter();
  const { code } = router.query;

  const [form, setForm] = useState<formProps>({
    user: null,
    products: [],
  });
  const [quantities, setQuantities] = useState<quantityProps[]>([]);

  useEffect(() => {
    if (code !== undefined) {
      (async () => {
        try {
          const response = await axios.get(
            `${constants.endpoint}/links/${code}`
          );
          const data = response.data;
          setForm({
            user: data.user,
            products: data.products,
          });
          setQuantities(
            data.products.map((p: Product) => {
              return {
                product_id: p.id,
                quantity: 0,
                price: p.price,
              };
            })
          );
        } catch (error) {
          console.error("error: ", error);
        }
      })();
    }
  }, [code]);

  const handleQuantityChange = (id: number, quantity: number) => {
    setQuantities(
      quantities.map((q) => {
        if (q.product_id === id) {
          return {
            ...q,
            quantity,
          };
        }
        return q;
      })
    );
  };

  const calculateTotal: () => number = () => {
    return quantities.reduce((s, p) => (s += p.quantity * p.price), 0);
  };

  return (
    <Layout>
      <div className="py-5 text-center">
        <h2>Welcome</h2>
        <p className="lead">
          {form.user?.first_name} {form.user?.last_name} has invited you to buy
          these products!
        </p>
      </div>

      <div className="row">
        <div className="col-md-4 order-md-2 mb-4">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">Products</span>
          </h4>
          <ul className="list-group mb-3">
            {form.products.map((product, index) => (
              <div key={index}>
                <li className="list-group-item d-flex justify-content-between lh-condensed">
                  <div>
                    <h6 className="my-0">{product.title}</h6>
                    <small className="text-muted">{product.description}</small>
                  </div>
                  <span className="text-muted">${product.price}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between lh-condensed">
                  <div>
                    <h6 className="my-0">Quantity</h6>
                  </div>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    style={{ width: "65px" }}
                    className="form-control text-muted"
                    onChange={(e) =>
                      handleQuantityChange(product.id, parseInt(e.target.value))
                    }
                  />
                </li>
              </div>
            ))}

            <li className="list-group-item d-flex justify-content-between">
              <span>Total (CAD)</span>
              <strong>${calculateTotal()}</strong>
            </li>
          </ul>
        </div>
        <div className="col-md-8 order-md-1">
          <h4 className="mb-3">Personal Info</h4>
          <form className="needs-validation">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  className="form-control"
                  id="firstName"
                  placeholder="First name"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                placeholder="1234 Main St"
                required
              />
            </div>

            <div className="row">
              <div className="col-md-5 mb-3">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  className="form-control"
                  id="country"
                  placeholder="Country"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="state">City</label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  placeholder="City"
                />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="zip">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="zip"
                  placeholder="Zip"
                  required
                />
              </div>
            </div>
            <hr className="mb-4" />

            <button
              className="btn btn-primary btn-lg btn-block w-100"
              type="submit"
            >
              Checkout
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
