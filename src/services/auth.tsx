import axios from "axios";

const apiUrl = import.meta.env.VITE_PROVIDER_BASE_URL;

export const registerProvider = async (
  username: string,
  name: string,
  email: string,
  password: string,
  gender: string,
  mobileNo: string
) => {
  try {
    const payload = {
      requestInfo: {
        apiId: "Rainmaker",
        ver: ".01",
        ts: null,
        action: "_create",
        did: "1",
        key: "",
        msgId: "20170310130900|en_IN",
        userInfo: {
          userName: "User",
          name: "Name",
          mobileNumber: "9999999999",
          emailId: "test@tekditechnologies.com",
          type: "EMPLOYEE",
          roles: [
            {
              name: "Employee",
              code: "EMPLOYEE",
              tenantId: "pg",
            },
          ],
          tenantId: "pg",
        },
      },
      user: {
        userName: username,
        name: name,
        gender: gender,
        emailId: email,
        mobileNumber: mobileNo,
        type: "EMPLOYEE",
        active: true,
        password: password,
        roles: [
          {
            name: "Employee",
            code: "EMPLOYEE",
            tenantId: "pg",
          },
        ],
        tenantId: "pg",
      },
    };
    const response = await axios.post(
      `${apiUrl}/user/users/_createnovalidate`,
      payload
    );
    return response?.data;
  } catch (error) {
    console.log(error);
  }
};

export const LoginProvider = async (email: string, password: string) => {
  try {
    const payload = {
      email: email,
      password: password,
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await axios.post(
      `${apiUrl}/auth/login`,
      payload,
      config
    );
    return response?.data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const sendOTP = async (otp: number, email: string) => {
  try {
    const payload = {
      email: email,
      otp: otp,
    };
    const response = await axios.post(`${apiUrl}/provider/login`, payload);
    return response.data.result;
  } catch (error) {
    console.log(error);
  }
};

export const userRegister = async (otp: number, email: string) => {
  try {
    const payload = {
      email: email,
      otp: otp,
    };
    const response = await axios.post(`${apiUrl}/provider/register`, payload);
    return response.data.result;
  } catch (error) {
    console.log(error);
  }
};
