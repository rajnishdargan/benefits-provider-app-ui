import { lazy } from "react";
const ViewApplicants = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicationLists")
);
const ApplicationDetails = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicationDetails")
);

const BenefitsForm = lazy(() => import("../pages/benefits/form/Form"));
// const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const ManageBenefits = lazy(
  () => import("../pages/benefits/manageBenefits/ManageBenefits")
);

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
    path: "/",
    component: ViewAllBenefits,
  },
  {
    path: "/applicants_list/:id",
    component: ViewApplicants,
  },
  {
    path: "/application_detail/:id",
    component: ApplicationDetails,
  },

  {
    path: "/manage-benefits",
    component: ManageBenefits,
  },
  {
    path: "*",
    component: ViewAllBenefits,
  },
];

export default routes;
