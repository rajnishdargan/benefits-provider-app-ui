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
    path: "/benefit/apply/:id",
    component: BenefitApplicationForm,
  },
  {
    path: "*",
    component: Login,
  },
];

export default routes;
