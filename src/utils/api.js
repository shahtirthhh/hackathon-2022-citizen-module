import axios from "axios";

export const generate_aadhar_otp = async (aadhar) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_REST_API + "/aadhar/generate-aadhar-otp",
      { aadhar }
    );
    return response;
  } catch (error) {
    if (error.response) return error.response.data;
    else
      return {
        code: "UNEXPECTED_ERROR",
        message: "An unexpected error occured, please try again later !",
        error: true,
      };
  }
};
export const verify_aadhar_otp = async (aadhar, otp) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_REST_API + "/aadhar/verify-aadhar-otp",
      { aadhar, otp }
    );
    return response;
  } catch (error) {
    if (error.response) return error.response.data;
    else
      return {
        code: "UNEXPECTED_ERROR",
        message: "An unexpected error occured, please try again later !",
        error: true,
      };
  }
};
export const verify_token = async (token) => {
  try {
    const response = await axios.post(
      process.env.REACT_APP_REST_API + "/citizen/verify-citizen-token",
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    if (error.response) return error.response.data;
    else
      return {
        code: "UNEXPECTED_ERROR",
        message: "An unexpected error occured, please try again later !",
        error: true,
      };
  }
};
