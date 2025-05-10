import { lazy } from "react";
const ViewApplicants = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicantDetails")
);
const ApplicationDetails = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicationDetails")
);

const BenefitsForm = lazy(() => import("../pages/benefits/form/Form"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

const ViewAllBenefits = lazy(
  () => import("../pages/benefits/viewAllBenefit/ViewAllBenefits")
);

//lazy loading
const routes = [
  {
    path: "/benefits/form",
    component: BenefitsForm,
  },

  {
    path: "/benefits/create/{id}",
    component: BenefitsForm,
  },
  {
    path: "/benefit_list",
    component: ViewAllBenefits,
  },
  {
    path: "/:id/applicants_list",
    component: ViewApplicants,
  },
  {
    path: "/application_detail/:id",
    component: ApplicationDetails,
  },

  {
    path: "*",
    component: Dashboard,
  },
];

export default routes;
