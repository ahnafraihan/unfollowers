// access array of account objects and reduce to usernames
const getUsers = accounts => accounts.map(f => f.string_list_data[0].value).filter(f => f);

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
      const following = getUsers(followingJSON.relationships_following);
      const followers = getUsers(followersJSON);

      // get reverse intersection of lists to find unfollowers
      const unfollowers = following.filter(x => !followers.includes(x));

      // display unfollowers
      document.getElementById('unfollowers').innerHTML = unfollowers.join(', ');
    };
    follower_reader.readAsText(followers_file);
  };
  following_reader.readAsText(following_file);
}
