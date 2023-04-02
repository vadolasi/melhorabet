import type { APIGatewayProxyHandler } from "aws-lambda"
import { SQS } from "@aws-sdk/client-sqs"

const sqs = new SQS({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY!
  }
})

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.body) {
    const body = JSON.parse(event.body)
    if (body.Customer && body.Customer.email) {
      const email = body.Customer.email
      const active = body.Subscription.status === "active"

      await sqs.sendMessage({
        QueueUrl: process.env.SQS_URL!,
        MessageBody: JSON.stringify({
          email,
          active
        })
      })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({})
  }
}
