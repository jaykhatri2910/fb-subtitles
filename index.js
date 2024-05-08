// require(dotenv).config();
const fs = require('fs');
const uuid = require('uuid').v4;
const axios = require('axios');
const path = require('path');
const outputDir = path.join(__dirname, 'output');
const httpRequest = require('./httpRequest')
const exec = require('child_process').exec;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const subtitleGlobalFilePath = [];

const downloadSubtitle = async (subtitles) => {
  try {
    console.log('subtitles:', subtitles)
    for (const subtitle of subtitles) {
      const url = subtitle.url
      const languageCode = subtitle.languageCode.toLowerCase()
      const countryCode = subtitle.countryCode.toUpperCase()
      const fileName = `${uuid()}.${languageCode}_${countryCode}.srt`
      const filePath = `output/${fileName}`

      console.log('filePath:', filePath)

      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
      })
      response.data.pipe(fs.createWriteStream(filePath))
      subtitleGlobalFilePath.push(filePath)
    }
  } catch (error) {
    console.log('error from download:', error)
    throw error
  }
}

const handler = async (event) => {
  try {
    // console.log('event:', event);
    let postData = event;
    if (process.env.ENVIRONMENT === 'lambda') {
      const Records = event.Records[0].body
      postData = JSON.parse(Records)
    }
    // console.dir(postData, { depth: null })
    const postType = postData.type
    const post = postData.post

    if (postType == 'Facebook' && post.subtitle.length != 0) {
      console.log("Subtitles found and started to download");
      // download all the subtitles and store the subtitle file in tmp, also name the files as uuid.languageCode_variant.srt
      await downloadSubtitle(post.subtitle);
      console.log("Subtitles downloaded successfully", subtitleGlobalFilePath);
      const accessToken = post.accessToken

      // curl - F 'captions_file=@"/home/gaurav/Downloads/testVid.nl_NL.srt"' - F 'method=POST' https://graph-video.facebook.com/v19.0/953247932883033/captions\?access_token\=EACABOlkXZAZCsBOZBo81dDUt5CzMOlTpU1c7hpIExhLuEeuQeLyE3a7XifMCsTmZAlxWjEpMGzfUlECvcTbWeQNlEmCTmUYyrNAvdNCRBx1cNKHiN1cGFEYv5eEGIpVxazMyhiIDG5OwI96JQlPnpSlA8LO1eF1oSpiz01qeeiftV3HkjEmejplxonZBZAtgs2ZCaPZAlJ8ZD\&default_locale\=none\&locales_to_delete\=\[\]
      // execute the above curl request for each subtitle file


      // now make the above curl request for each subtitle file using axios
      // const postId = post.postId
      console.log("Making axios call");
      const captionUrl = `https://graph-video.facebook.com/v19.0/429063096495630/captions?access_token=${accessToken}&default_locale=none&locales_to_delete=[]`
      for (const subtitle of subtitleGlobalFilePath) {
        const fpath = path.resolve(subtitle);
        console.log('subtitle:', subtitle)
        console.log({
          url: captionUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
          },
          caption_file: "@/" + subtitle,

        })
        const urlData = await httpRequest(
          {
            url: captionUrl,
            method: 'POST',
            headers: {
              'Content-Type': 'application/octet-stream',
            },
            caption_file: "@/" + subtitle,

          },
          '3m',
        )
        console.log("captions Status: ", urlData);
      }


      // console.log("Making curl call");
      // for (const subtitleFilePath of subtitleGlobalFilePath) {
      //   let command = `curl -F 'captions_file=@\"${subtitleFilePath}\"' -F 'method=POST' 'https://graph-video.facebook.com/v19.0/1109093056874668/captions?access_token=EACABOlkXZAZCsBOZBo81dDUt5CzMOlTpU1c7hpIExhLuEeuQeLyE3a7XifMCsTmZAlxWjEpMGzfUlECvcTbWeQNlEmCTmUYyrNAvdNCRBx1cNKHiN1cGFEYv5eEGIpVxazMyhiIDG5OwI96JQlPnpSlA8LO1eF1oSpiz01qeeiftV3HkjEmejplxonZBZAtgs2ZCaPZAlJ8ZD&default_locale=none&locales_to_delete=[]'`;
      //   exec(command, function (error, stdout, stderr) {
      //     console.log('stdout: ' + stdout);
      //     console.log('stderr: ' + stderr);
      //     if (error !== null) {
      //       console.log('exec error: ' + error);
      //     }
      //   });
      // }

    }
  }
  catch (error) {
    console.log('error - ', error)
    console.log('error')
  }
}

handler({
  type: 'Facebook',
  post: {
    id: '3be43af9-b656-4b8e-a773-56195ab759c5',
    part: 'id,snippet,status',
    requestBody: {
      snippet: {
        title: 'file_example_MP4_640_3MG',
        description: '',
        tags: [],
        categoryId: '',
        playlistIds: []
      },
      status: {
        privacyStatus: 'public',
        youtubeLicense: 'youtube',
        youtubeMadeForKids: false,
        youtubeAllowEmbedding: false
      },
      youtubeNotifySubscriber: false
    },
    accessToken: "EACABOlkXZAZCsBOZBo81dDUt5CzMOlTpU1c7hpIExhLuEeuQeLyE3a7XifMCsTmZAlxWjEpMGzfUlECvcTbWeQNlEmCTmUYyrNAvdNCRBx1cNKHiN1cGFEYv5eEGIpVxazMyhiIDG5OwI96JQlPnpSlA8LO1eF1oSpiz01qeeiftV3HkjEmejplxonZBZAtgs2ZCaPZAlJ8ZD",
    media: {
      body: 'https://awsstage-test-video.s3.amazonaws.com/107891/bc9c4370-d59e-439e-8394-18c868007a7a.mp4'
    },
    thumbnails: [
      'https://awsstage-test-resize-image.s3.amazonaws.com/107891/1714987213-py-0b803649.jpg'
    ],
    subtitle: [
      {
        "url": "https://awsstage-test-video.s3.amazonaws.com/107891/1358bd46-01b2-4b45-8d24-d6bd54918c0b.srt",
        "language": "English",
        "languageCode": "ne",
        "variant": "United Kingdom",
        "countryCode": "NP"
      },
      // {
      //   "url": "https://awsstage-test-video.s3.amazonaws.com/107891/1358bd46-01b2-4b45-8d24-d6bd54918c0b.srt",
      //   "language": "English",
      //   "languageCode": "en",
      //   "variant": "United States",
      //   "countryCode": "US"
      // },
      // {
      //   "url": "https://awsstage-test-video.s3.amazonaws.com/107891/1358bd46-01b2-4b45-8d24-d6bd54918c0b.srt",
      //   "language": "Hindi",
      //   "languageCode": "hi",
      //   "variant": "India",
      //   "countryCode": "IN"
      // },
      // {
      //   "url": "https://awsstage-test-video.s3.amazonaws.com/107891/1358bd46-01b2-4b45-8d24-d6bd54918c0b.srt",
      //   "language": "Punjabi",
      //   "languageCode": "nl",
      //   "variant": "India",
      //   "countryCode": "NL"
      // }
    ],
    postId: '3be43af9-b656-4b8e-a773-56195ab759c5',
    loginId: 1049959,
    originalData: {

    }
  }
})
