export const withId = (doc) => {
  if (!doc) return doc;
  const payload = doc.toObject ? doc.toObject() : { ...doc };
  if (!payload.id && payload._id) {
    payload.id = payload._id.toString();
  }
  return payload;
};

export const toUserPayload = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  const hasProfile = user.name || user.email || user._id || user.id;
  if (!hasProfile) {
    return typeof user.toString === "function" ? user.toString() : user;
  }
  return {
    id: user._id?.toString?.() ?? user.id,
    _id: user._id ?? user.id,
    name: user.name,
    email: user.email
  };
};

export const withMembers = (group) => {
  const payload = withId(group);
  if (payload && Array.isArray(payload.members)) {
    payload.members = payload.members.map((member) =>
      member && typeof member === "object" ? toUserPayload(member) : member
    );
  }
  if (payload?.owner && typeof payload.owner === "object") {
    payload.owner = toUserPayload(payload.owner);
  }
  return payload;
};
