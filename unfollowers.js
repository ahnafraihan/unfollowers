// access array of account objects and reduce to usernames
const getUsers = (accounts) =>
  accounts.map((f) => f.string_list_data[0].value).filter((f) => f);

// create hyperlink text for a given unfollower account
const createUnfollowerLink = (unfollower) =>
  '<a class="unfollower" href="https://www.instagram.com/' +
  unfollower +
  '" target="_blank"> @' +
  unfollower +
  "</a>" +
  "<br>";

// populate unfollowers field with given message
const sendUnfollowers = (msg) =>
  (document.getElementById("unfollowers").innerHTML = msg);

// populate error field with given message
const getError = (msg) =>
  (document.getElementById("unfollowers").innerHTML =
    '<span class="error">' + msg + "</span>");

// compare follower & following data via instagram and return list of unfollowers
const getUnfollowers = async () => {
  const unfollowers_zip = document.getElementById("unfollowers_zip").files[0];

  // confirm zip file was uploaded
  if (!unfollowers_zip) {
    getError("Upload your unfollowers zip file.");
    return;
  }

  // unzip unfollowers file
  const zip = await JSZip.loadAsync(unfollowers_zip);

  // get followers_and_following folder
  const followers_and_following = zip.folder(
    "connections/followers_and_following",
  );

  // get followers & following promises
  const followers_promise = followers_and_following.file("followers_1.json")?.async("string");
  const following_promise = followers_and_following.file("following.json")?.async("string");

  // retrieve followers & following files via promises
  const [followers_file, following_file] = await Promise.all([
    followers_promise,
    following_promise,
  ]);

  // parse followers & following into JSON objects
  const followers_json = JSON.parse(followers_file);
  const following_json = JSON.parse(following_file);

  // get list of usernames (followers & following)
  let followers, following;
  try {
    followers = getUsers(followers_json);
    following = getUsers(following_json.relationships_following);
  } catch (error) {
    getError(
      "Error processing your data. <br/> Make sure the correct files were uploaded.",
    );
  }

  // get reverse intersection of lists to find unfollowers
  const unfollowers = following.filter((x) => !followers.includes(x));

  // display unfollowers
  if (!unfollowers.length) {
    sendUnfollowers('<span class="gradient">No unfollowers</span>');
  } else {
    let unfollowersHTML = "";
    for (unfollower of unfollowers) {
      unfollowersHTML += createUnfollowerLink(unfollower);
    }
    sendUnfollowers(unfollowersHTML);
  }
};
