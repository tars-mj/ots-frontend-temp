export const getData = async (url: URL): Promise<unknown> => {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const postData = async (url: URL, body: object): Promise<unknown> => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return 'Brak autoryzacji';
  }
};

export const postFileData = async (url: URL, file: Blob): Promise<unknown> => {
  try {
    // const dataFile = new URLSearchParams(body);
    const formdata = new FormData();
    formdata.append('file', file, file.name);
    const res = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formdata
    });

    const data = await res.json();
    return data;
  } catch (error) {
    return 'Brak autoryzacji';
  }
};

export const patchData = async (url: URL, body: object): Promise<unknown> => {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

// prefixed with underscored because delete is a reserved word in javascript
export const deleteData = async (url: URL): Promise<unknown> => {
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    });

    return res.ok;
  } catch (error) {
    console.log(error);
  }
};

// helper functions
function handleResponse(response: { text: () => Promise<any>; ok: any; statusText: any }) {
  return response.text().then((text: string) => {
    const data = text && JSON.parse(text);

    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
