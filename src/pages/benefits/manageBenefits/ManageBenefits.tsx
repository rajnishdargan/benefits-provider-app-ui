import React from "react";
import Layout from "../../../components/layout/Layout";

const ManageBenefits: React.FC = () => {
  return (
    <Layout showMenu={true} showSearchBar={true} showLanguage={false}>
      <div style={{ width: "100%", height: "100vh" }}>
        <iframe
          src={import.meta.env.VITE_PROVIDER_CATALOG_URL || "https://depwd-provider-catalog.digivrtti.com/"}
          title="Manage Benefits"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
    </Layout>
  );
};

export default ManageBenefits;
