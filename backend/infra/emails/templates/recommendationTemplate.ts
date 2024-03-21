export const recommendationTemplate = `
<!DOCTYPE html>
<html lang=\"en\">
  <head>
    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />
  </head>
  <body>
    <div>Hey there: {{User.UserAttributes.Email}}!</div>
    <div>Here are you weekly recommendations:</div>
    <div>
      <ul>
        <li>{{Recommendations.Name.[0]}} - {{Recommendations.Category.[0]}}</li>
        <li>{{Recommendations.Name.[1]}} - {{Recommendations.Category.[1]}}</li>
        <li>{{Recommendations.Name.[2]}} - {{Recommendations.Category.[2]}}</li>
        <li>{{Recommendations.Name.[3]}} - {{Recommendations.Category.[3]}}</li>
        <li>{{Recommendations.Name.[4]}} - {{Recommendations.Category.[4]}}</li>
      </ul>
    </div>
  </body>
</html>
`