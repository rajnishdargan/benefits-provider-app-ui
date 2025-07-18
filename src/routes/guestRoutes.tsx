import { lazy } from "react";
const UserRegister = lazy(() => import("../pages/auth/UserRegister"));
const Login = lazy(() => import("../pages/auth/Login"));
const OTP = lazy(() => import("../pages/auth/OTP"));
import BenefitApplicationForm from "../pages/benefits/benefitFormUI/BenefitApplicationForm";

//lazy loading
const routes = [
  {
    path: "/otp",
    component: OTP,
  },
  {
    path: "/user/register",
    component: UserRegister,
  },
  {
    // Duplicate route intentionally - needed for guest users
    // when form is embedded in iframe from external applications
    path: "/benefit/apply/:id",
    component: BenefitApplicationForm,
  },
  {
    path: "*",
    component: Login,
  },
];

export default routes;
