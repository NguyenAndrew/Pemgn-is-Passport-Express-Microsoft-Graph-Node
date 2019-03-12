var graph = require('@microsoft/microsoft-graph-client');

// Use the provided access token to authenticate requests
function getAuthenticatedClient(accessToken) {
  return graph.Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
}

module.exports = {
  getUserDetails: async function (accessToken) {
    const client = getAuthenticatedClient(accessToken);
    const user = await client.api('/me').get();
    return user;
  },

  getEvents: async function (accessToken) {
    const client = getAuthenticatedClient(accessToken);
    const events = await client
      .api('/me/events')
      .select('subject,organizer,start,end')
      .orderby('createdDateTime DESC')
      .get();
    return events;
  }
};