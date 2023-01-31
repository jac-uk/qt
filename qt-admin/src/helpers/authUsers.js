const authorisedUsers = [
  'warren.searle@judicialappointments.digital',
  'tom.russell@judicialappointments.digital',
  'andrew.isaac@judicialappointments.digital',
  'halcyon@judicialappointments.digital',
  'drie@judicialappointments.digital',
];

const authorisedToPerformAction = async (email) => {
  return authorisedUsers.includes(email);
};

export {
  authorisedToPerformAction
};

