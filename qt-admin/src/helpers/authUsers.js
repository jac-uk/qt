const authorisedUsers = [
  'warren.searle@judicialappointments.digital',
  'tom.russell@judicialappointments.digital',
  'nick.addy@judicialappointments.gov.uk',
  'halcyon@judicialappointments.digital',
  'drie@judicialappointments.digital',
  'joe.beauchamp@judicialappointments.digital',
  'grant.mcmillan@judicialappointments.digital',
];

const authorisedToPerformAction = async (email) => {
  return authorisedUsers.includes(email);
};

export {
  authorisedToPerformAction
};

