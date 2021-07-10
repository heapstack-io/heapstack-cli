export const hello_world = `
module.exports.example = async (event, context, callback) => {
  const { path, queryStringParameters, headers, body, httpMethod } = event;
    const response = {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            greetings: 'Hello from Heapstack !',
            httpMethod,
            path,
            queryStringParameters,
            headers,
            body:JSON.parse(body)
        })
    };
    callback(null, response);
}
`;
