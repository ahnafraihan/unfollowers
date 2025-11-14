// access array of account objects and reduce to usernames by parsing varying formats
const getUsers = (data) => {
  if (!data) return [];

  let entries;
  if (Array.isArray(data)) {
    // followers_1.json as array
    entries = data;
  } else if (typeof data === "object") {
    // or other known formats
    entries =
      data.relationships_following ||
      data.relationships_followers ||
      data.followers ||
      data.accounts ||
      [];
  } else {
    return [];
  }

  return entries
    .map((entry) => {
      if (!entry) return null;

      const sld = Array.isArray(entry.string_list_data)
        ? entry.string_list_data[0]
        : null;

      // normal case: value field exists
      if (sld && sld.value) {
        return sld.value;
      }

      // otherwise, username may the title
      if (entry.title) {
        return entry.title;
      }

      // else, get the profile url
      if (sld && sld.href) {
        const match = sld.href.match(/instagram\.com\/(?:_u\/)?([^/?]+)/);
        if (match && match[1]) return match[1];
      }

      // fallback formats
      if (typeof entry === "string") return entry;
      if (entry.value) return entry.value;

      return null;
    })
    .filter(Boolean);
};

// create link for an unfollower
const createUnfollowerLink = (unfollower) =>
  '<a class="unfollower" href="https://www.instagram.com/' +
  unfollower +
  '" target="_blank"> @' +
  unfollower +
  "</a><br>";

// set unfollowers html
const sendUnfollowers = (msg) =>
  (document.getElementById("unfollowers").innerHTML = msg);

// set error message
const getError = (msg) =>
  (document.getElementById("unfollowers").innerHTML =
    '<span class="error">' + msg + "</span>");

// find a file in the zip by its name
const findFileInZip = (zip, predicate) => {
  const files = Object.keys(zip.files);
  return files.find(predicate) || null;
};

const getUnfollowers = async () => {
  const unfollowers_zip = document.getElementById("unfollowers_zip").files[0];

  // confirm zip file was uploaded
  if (!unfollowers_zip) {
    getError("Upload your Instagram ZIP file.");
    return;
  }

  // unzip unfollowers file
  let zip;
  try {
    zip = await JSZip.loadAsync(unfollowers_zip);
  } catch (e) {
    console.error(e);
    getError("Could not read the ZIP file. Make sure it came from Instagram.");
    return;
  }

  // get followers & following files (using flexible paramaters in case names change)
  const followersPath = findFileInZip(
    zip,
    (name) =>
      name.endsWith("followers.json") || name.endsWith("followers_1.json"),
  );

  const followingPath = findFileInZip(zip, (name) =>
    name.endsWith("following.json"),
  );

  if (!followersPath || !followingPath) {
    getError(
      "Could not find followers.json / followers_1.json or following.json.<br/>" +
        "Make sure you downloaded JSON format from Instagram.",
    );
    return;
  }

  // parse followers & following into JSON objects
  let followers_json, following_json;
  try {
    const [followers_file, following_file] = await Promise.all([
      zip.file(followersPath).async("string"),
      zip.file(followingPath).async("string"),
    ]);

    followers_json = JSON.parse(followers_file);
    following_json = JSON.parse(following_file);
  } catch (e) {
    console.error(e);
    getError("Error reading Instagram data. Make sure it's JSON, not HTML.");
    return;
  }

  // get list of usernames (followers & following)
  let followers, following;
  try {
    followers = getUsers(followers_json);
    following = getUsers(following_json);
  } catch (error) {
    console.error(error);
    getError(
      "Error processing your data. Instagram may have changed the format.",
    );
    return;
  }

  // get reverse intersection of lists to find unfollowers
  const unfollowers = following.filter((x) => !followers.includes(x));

  // display unfollowers
  if (!unfollowers.length) {
    sendUnfollowers('<span class="gradient">No unfollowers</span>');
  } else {
    let unfollowersHTML = "";
    for (const unfollower of unfollowers) {
      unfollowersHTML += createUnfollowerLink(unfollower);
    }
    sendUnfollowers(unfollowersHTML);
  }
};
