const authorisedUsers = [
  'warren.searle@judicialappointments.digital',
  'tom.russell@judicialappointments.digital',
  'nick.addy@judicialappointments.gov.uk',
  'halcyon@judicialappointments.digital',
  'drie@judicialappointments.digital',
];

const authorisedToPerformAction = async (email) => {
  return authorisedUsers.includes(email);
};

export {
  authorisedToPerformAction
};

