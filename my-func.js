exports.handler = async (event) => {
    // TODO implement
    keyword = event.queryStringParameters.keyword
    const msg = "Akash says "+keyword
    const response = {
        statusCode: 200,
        body: JSON.stringify({
      msg
    })
    
    };
    return response;
};