Posts = new Meteor.Collection('posts');

Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  post: function(postAttributes) {
    var user = Meteor.user();
    
     // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");
    
    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');

    // ensure the post has a url
    if (!postAttributes.url)
      throw new Meteor.Error(422, 'Please fill in a url');

    // check that there are no previous posts with the same link
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 'This link has already been posted', postWithSameLink._id);
    }
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'url', 'title', 'message'), {
      commentsCount: 0,
      userId: user._id,
      author: user.username,
      submitted: new Date().getTime()
    });
    var postId = Posts.insert(post);
    return postId;
  }
  
});