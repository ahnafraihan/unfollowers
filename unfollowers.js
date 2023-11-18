const getUsers = accounts => accounts.map(f => f.string_list_data[0].value).filter(f => f);

const getUnfollowers = () => {
  const following_file = document.getElementById('following_file').files[0];
  const followers_file = document.getElementById('followers_file').files[0];

  if (!following_file) {
    alert('upload following.json');
    return;
  }

  if (!followers_file) {
    alert('upload followers_1.json ');
    return;
  }

  const following_reader = new FileReader();
  const follower_reader = new FileReader();

  following_reader.onload = function() {
    const followingJSON = JSON.parse(this.result);

    follower_reader.onload = function() {
      const followersJSON = JSON.parse(this.result);
      
      const following = getUsers(followingJSON.relationships_following);
      const followers = getUsers(followersJSON);

      const unfollowers = following.filter(x => !followers.includes(x));
      document.getElementById('result').innerHTML = unfollowers.join(', ');
    };
    follower_reader.readAsText(followers_file);
  };
  following_reader.readAsText(following_file);
}