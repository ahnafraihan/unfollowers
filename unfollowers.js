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

const getError = (msg) =>
  (document.getElementById("unfollowers").innerHTML =
    '<span class="error">' + msg + "</span>");

// compare follower & following data via instagram and return list of unfollowers
const getUnfollowers = () => {
  // get files for following & followers
  const following_file = document.getElementById("following_file").files[0];
  const followers_file = document.getElementById("followers_file").files[0];

  // confirm files were uploaded
  if (!following_file) {
    getError("Upload your following data (following.json)");
    return;
  }
  if (!followers_file) {
    getError("Upload your followers data (followers_1.json)");
    return;
  }

  // instantiate file readers
  const following_reader = new FileReader();
  const follower_reader = new FileReader();

  following_reader.onload = function () {
    // parse following into JSON object
    const followingJSON = JSON.parse(this.result);

    follower_reader.onload = function () {
      // parse followers into JSON object
      const followersJSON = JSON.parse(this.result);

      // get list of usernames (following & followers)
      let following, followers;
      try {
        following = getUsers(followingJSON.relationships_following);
        followers = getUsers(followersJSON);
      } catch (error) {
        getError(
          "Error processing your data. <br/> Make sure the correct files were uploaded.",
        );
      }

      // get reverse intersection of lists to find unfollowers
      const unfollowers = following.filter((x) => !followers.includes(x));

      // display unfollowers
      if (!unfollowers.length) {
        document.getElementById("unfollowers").innerHTML =
          '<span class="gradient">No unfollowers</span>';
      } else {
        let unfollowersHTML = "";
        for (unfollower of unfollowers) {
          unfollowersHTML += createUnfollowerLink(unfollower);
        }
        document.getElementById("unfollowers").innerHTML = unfollowersHTML;
      }
    };
    follower_reader.readAsText(followers_file);
  };
  following_reader.readAsText(following_file);
};
