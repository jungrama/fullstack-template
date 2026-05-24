import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Endpoint = process.env.R2_ENDPOINT;
const r2Bucket = process.env.R2_BUCKET_NAME;

const r2Client =
  r2Endpoint && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: r2Endpoint,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

function assertR2Configured() {
  if (!r2Client || !r2Bucket) {
    throw new Error("R2 is not configured");
  }
  return { client: r2Client, bucket: r2Bucket };
}

export async function uploadAvatarToStorage(params: {
  userId: string;
  file: File;
}): Promise<{ key: string }> {
  const { client, bucket } = assertR2Configured();
  const ext = (params.file.name?.split(".").pop() || "jpg").toLowerCase();
  const key = `avatars/${params.userId}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await params.file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: params.file.type || "application/octet-stream",
      CacheControl: "private, max-age=0, no-cache",
    }),
  );

  return { key };
}

export async function uploadCompanyLogoToStorage(params: {
  companyId: string;
  file: File;
}): Promise<{ key: string }> {
  const { client, bucket } = assertR2Configured();
  const ext = (params.file.name?.split(".").pop() || "jpg").toLowerCase();
  const key = `companies/${params.companyId}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await params.file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: params.file.type || "application/octet-stream",
      CacheControl: "private, max-age=0, no-cache",
    }),
  );

  return { key };
}

export async function getSignedObjectUrl(
  key: string,
  expiresInSeconds = 60 * 10,
): Promise<string> {
  const { client, bucket } = assertR2Configured();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    { expiresIn: expiresInSeconds },
  );
}
