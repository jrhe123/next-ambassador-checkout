import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
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
interface infoFormProps {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  country: string;
  city: string;
  zip: string;
}

export default function Home() {
  const router = useRouter();
  const { code } = router.query;

  const [form, setForm] = useState<formProps>({
    user: null,
    products: [],
  });
  const [quantities, setQuantities] = useState<quantityProps[]>([]);
  const [infoForm, setInfoForm] = useState<infoFormProps>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    country: "",
    city: "",
    zip: "",
  });

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInfoForm({
      ...infoForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    try {
      const params = {
        first_name: infoForm.firstName.trim(),
        last_name: infoForm.lastName.trim(),
        email: infoForm.email.trim(),
        address: infoForm.address.trim(),
        country: infoForm.country.trim(),
        city: infoForm.city.trim(),
        zip: infoForm.zip.trim(),
        code,
        products: quantities
          .map((p) => {
            return {
              product_id: p.product_id,
              quantity: p.quantity,
            };
          })
          .filter((p) => p.quantity > 0),
      };
      if (!params.products.length) {
        alert("Invalid product quantity");
        return;
      }
      const response = await axios.post(`${constants.endpoint}/orders`, params);
      const { data } = response;
      console.log("data: ", data);
    } catch (error) {
      console.error(error);
    }
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
                    min={1}
                    value={
                      quantities.find((p) => p.product_id === product.id)
                        ?.quantity
                    }
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
          <form className="needs-validation" onSubmit={handleFormSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="First name"
                  required
                  name="firstName"
                  value={infoForm.firstName}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Last name"
                  required
                  name="lastName"
                  value={infoForm.lastName}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                required
                name="email"
                value={infoForm.email}
                onChange={handleFormChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                className="form-control"
                placeholder="1234 Main St"
                required
                name="address"
                value={infoForm.address}
                onChange={handleFormChange}
              />
            </div>

            <div className="row">
              <div className="col-md-5 mb-3">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Country"
                  required
                  name="country"
                  value={infoForm.country}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="state">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  required
                  name="city"
                  value={infoForm.city}
                  onChange={handleFormChange}
                />
              </div>
              <div className="col-md-3 mb-3">
                <label htmlFor="zip">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Postal Code"
                  required
                  name="zip"
                  value={infoForm.zip}
                  onChange={handleFormChange}
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
