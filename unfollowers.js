// access array of account objects and reduce to usernames
const getUsers = accounts => accounts.map(f => f.string_list_data[0].value).filter(f => f);

// creates hyperlink text for a given unfollower account
const createUnfollowerLink = unfollower => 
  "<a href=\"https://www.instagram.com/" + 
  unfollower + 
  "\" target=\"_blank\"> @" + 
  unfollower + 
  "</a>" + 
  "<br>";

// compare follower & following data via instagram and return list of unfollowers
const getUnfollowers = () => {
  // get files for following & followers
  const following_file = document.getElementById('following_file').files[0];
  const followers_file = document.getElementById('followers_file').files[0];

  // confirm files were uploaded
  if (!following_file) {
    alert('upload following.json');
    return;
  }

  if (!followers_file) {
    alert('upload followers_1.json ');
    return;
  }

  // instantiate file readers
  const following_reader = new FileReader();
  const follower_reader = new FileReader();

  following_reader.onload = function() {
    // parse following into JSON object
    const followingJSON = JSON.parse(this.result);

    follower_reader.onload = function() {
      // parse followers into JSON object
      const followersJSON = JSON.parse(this.result);
      
      // get list of usernames (following & followers)
      let following, followers;
      try {
        following = getUsers(followingJSON.relationships_following);
        followers = getUsers(followersJSON);
      } catch (error) {
        document.getElementById('unfollowers').innerHTML = "Error processing your data. Make sure correct files were uploaded";
      }

      // get reverse intersection of lists to find unfollowers
      const unfollowers = following.filter(x => !followers.includes(x));

      // display unfollowers
      if (!unfollowers.length) {
        document.getElementById('unfollowers').innerHTML = "No unfollowers";
      } else {
        let unfollowersHTML = "";
        for (unfollower of unfollowers) {
          unfollowersHTML += createUnfollowerLink(unfollower);
        }
        document.getElementById('unfollowers').innerHTML = unfollowersHTML;
      }
    }
    follower_reader.readAsText(followers_file);
  }
  following_reader.readAsText(following_file);
}
