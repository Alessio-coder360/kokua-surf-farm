// Netlify Function: check-admin.js

exports.handler = async function(event, context) {
  // Password segreta SOLO qui!
  const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD;

  // Ricevi la password da controllare
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid JSON" })
    };
  }

  if (body.password === ADMIN_PASSWORD) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: "Wrong password" })
    };
  }
};
