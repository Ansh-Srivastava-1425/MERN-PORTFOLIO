import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  proficiency: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    aboutMe: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    githubURL: {
      type: String,
    },
    linkedinURL: {
      type: String,
    },
    portfolioURL: {
      type: String,
    },
    avatar: {
      type: String,
    },
    skills: [skillSchema],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
