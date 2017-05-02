# FreeCodeCamp: URL Shortener Microservice

### User stories:

* I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
* When I visit that shortened URL, it will redirect me to my original link.

#### Example creation usage:
```
	https://micurl.herokuapp.com/new/https://www.google.com
	https://micurl.herokuapp.com/new/http://foo.com:80
```

#### Example creation output
```
{
	"original_url":"http://foo.com:80",
	"short_url":"https://micurl.herokuapp.com/HJcn_29Eb"
}
```

#### Usage:
```
https://micurl.herokuapp.com/HkSTLh5VW
```
Will redirect to:

```
https://www.google.com
```

Created by Maksad D.
