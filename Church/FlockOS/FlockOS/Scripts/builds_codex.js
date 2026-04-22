// AUTO-GENERATED from FlockOS/Tools/Build Documents/Flock Deployments/Builds.md
// Used by FlockOS_Churches.html — eliminates fetch() so the page works locally (file://).
// To update: edit Builds.md, then regenerate this file.

window.FLOCK_BUILDS_DATA = {
  root: {
    type: 'root',
    name: 'FlockOS',
    short: 'Master Build',
    href: 'FlockOS.html',
    image: 'FlockOS/Images/FlockOS_AppIcon.png',
    alt: 'FlockOS',
    description: 'The root source deployment and single source of truth for every church release.',
    badge: 'Open Master Build'
  },
  deployments: [
    {
      type: 'deployment',
      name: 'FlockOS Demo',
      short: 'Demo',
      href: 'Church/FlockOS/index.html',
      image: 'FlockOS/Images/FlockOS_Pink.png',
      alt: 'FlockOS Demo',
      description: 'This is the base deployment for testing FlockOS in a flexible, general church setting.',
      badge: 'Open Deployment'
    },
    {
      type: 'deployment',
      name: 'The Wellspring',
      short: 'GAS Deployment',
      href: 'Church/GAS/index.html',
      image: 'FlockOS/Images/FlockOS_Orange.png',
      alt: 'The Wellspring',
      description: 'This is the base deployment tailored for testing the offline features via the "Wellspring."',
      badge: 'Open Deployment'
    },
    {
      type: 'deployment',
      name: 'Trinity Baptist',
      short: 'TBC-Indio',
      href: 'Church/TBC/index.html',
      image: 'FlockOS/Images/FlockOS_Blue.png',
      alt: 'Trinity Baptist Church',
      description: 'Deployment configured for Trinity Baptist and its local church and ministry work.',
      badge: 'Open Deployment'
    },
    {
      type: 'deployment',
      name: 'The Forest',
      short: 'The Forest',
      href: 'Church/TheForest/index.html',
      image: 'FlockOS/Images/FlockOS_Green.png',
      alt: 'The Forest',
      description: 'Deployment shaped for The Forest and its local church and shared build branch.',
      badge: 'Open Deployment'
    }
  ]
};
