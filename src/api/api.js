// api.js

import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

async function fetchData(query) {
  try {
    const response = await monday.api(query);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error fetching data. Please try again.");
  }
}

export { fetchData };
