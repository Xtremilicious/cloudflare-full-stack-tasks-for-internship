class ElementHandler {
  constructor(content) {
    this.content = content;
  }
  element(element) {
    if (element.tagName === "a") {
      //Seeting my own URL
      element.setAttribute("href", "https://xtremilicious.github.io");

      //Modify content
      element.setInnerContent(this.content);
    } else {
      //Modify content
      element.setInnerContent(this.content);
    }
  }
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cookie_name = "ab-testing";

  const initialOptions = {
    headers: {
      "content-type": "application/json",
    },
  };

  const finalOptions = {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  };

  const intialFetchURL = "https://cfw-takehome.developers.workers.dev/api/variants";

  //Fetching intialFetchURL and parsing it to JSON
  const intitialResponse = await fetch(intialFetchURL, initialOptions);
  const intitialResult = await intitialResponse.json();

  let variantFetched, cookieToSet;
  const cookie = request.headers.get("cookie");

  if (cookie && cookie.includes(`${cookie_name}=variant1`)) {
    variantFetched = intitialResult.variants[0];
  } else if (cookie && cookie.includes(`${cookie_name}=variant2`)) {
    variantFetched = intitialResult.variants[1];
  } else {
    //Cookie not found
    // 50-50 split of URL variant
    variantFetched = Math.random() < 0.5 ? intitialResult.variants[0] : intitialResult.variants[1];
    cookieToSet = variantFetched === intitialResult.variants[0] ? "variant1" : "variant2";
  }

  //Fetching variantFetched URL as text/html
  const variantResponse = await fetch(variantFetched, finalOptions);
  let variantResult = await variantResponse;

  //Bonus Tasks: Modifying the title, h1#title, p#description, a#url
  let modifiedResult = variantResult;

  //Modifying the title
  modifiedResult = new HTMLRewriter()
    .on("title", new ElementHandler("Cloudflare Internship Test"))
    .transform(modifiedResult);

  //Modifying the h1#title
  modifiedResult = new HTMLRewriter()
    .on("h1#title", new ElementHandler("A/B Testing Works!"))
    .transform(modifiedResult);

  //Modifying the p#description
  const variant = variantFetched.charAt(variantFetched.length - 1);
  modifiedResult = new HTMLRewriter()
    .on("p#description", new ElementHandler(`You are currently on variant ${variant} :)`))
    .transform(modifiedResult);

  //Modifying the a#url
  modifiedResult = new HTMLRewriter()
    .on("a#url", new ElementHandler(`Return to my website`))
    .transform(modifiedResult);

  //Returning response
  modifiedResult = await modifiedResult.text();
  response = new Response(modifiedResult, finalOptions);
  if (cookie === null) {
    response.headers.append("Set-Cookie", `${cookie_name}=${cookieToSet}; path=/`);
  }

  return response;

  // Determine which group this requester is in.
}
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});
