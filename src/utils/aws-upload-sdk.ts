import { ListBucketsCommand, S3, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY as string,
    secretAccessKey: process.env.DO_SPACES_SECRET as string,
  },
});

// Returns a list of Spaces in your region.
export const getListOfSpaces = async () => {
  try {
    const data = await s3Client.send(new ListBucketsCommand({}));
    console.log("Success", data.Buckets);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
};

// Uploads the specified file to the chosen path.
export const uploadFile = async (filename: string) => {
  try {
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.DO_SPACES_NAME as string,
        Key: filename,
        Body: "content",
      })
    );
    console.log(data);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

export { s3Client };
