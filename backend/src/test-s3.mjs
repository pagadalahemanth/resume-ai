import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function testS3Connection() {
    try {
        console.log('Testing S3 connection...');
        const command = new ListBucketsCommand({});
        const response = await s3Client.send(command);
        console.log('Connection successful!');
        console.log('Available buckets:', response.Buckets?.map(b => b.Name));
    } catch (error) {
        console.error('Error connecting to S3:', error);
    }
}

testS3Connection();