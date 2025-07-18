import { lazy } from "react";
const ViewApplicants = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicationLists")
);
const ApplicationDetails = lazy(
  () => import("../pages/benefits/viewAllBenefit/ApplicationDetails")
);

const BenefitsForm = lazy(() => import("../pages/benefits/form/Form"));
// //NOSONAR const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const ManageBenefits = lazy(
  () => import("../pages/benefits/manageBenefits/ManageBenefits")
);

const ViewAllBenefits = lazy(
  () => import("../pages/benefits/viewAllBenefit/ViewAllBenefits")
);

const AddProvider = lazy(() => import("../pages/admin/AddProvider"));
const AddProviderUser = lazy(() => import("../pages/admin/AddProviderUser"));

const BenefitApplicationForm = lazy(() =>
  import("../pages/benefits/benefitFormUI/BenefitApplicationForm"));

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
    // Duplicate route intentionally - needed for authenticated users
    // when form is embedded in iframe from external applications
    path: "/benefit/apply/:id",
    component: BenefitApplicationForm,
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
    path: "/admin/add-role",
    component: AddProvider,
    requireSuperAdmin: true,
  },
  {
    path: "/admin/add-user",
    component: AddProviderUser,
    requireSuperAdmin: true,
  },
  {
    path: "*",
    component: ViewAllBenefits,
  },
];

export default routes;
