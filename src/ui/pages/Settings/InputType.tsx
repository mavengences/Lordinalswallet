import axios from 'axios';
import React, { useState } from 'react';

import { ChangeUrl, OPENAPI_URL_MAINNET } from '@/shared/constant';
import { Header, Layout } from '@/ui/components';
import { useInput } from '@/ui/utils/InputContext';

const InputType = () => {
  const { inputValue, setInput, setInputValue2, inputValue2 } = useInput();
  const [check, setCheck] = useState<boolean>();
  const handleInputChange = (event: any) => {
    setInput(event.target.value);
    setInputValue2(event.target.value);
  };

  const handleSubmit = async () => {
    ChangeUrl(inputValue);
    setCheck(true);
    setTimeout(() => {
      setCheck(false);
      window.history.go(-1);
      setInput('');
      ChangeUrl('');
    }, 500);
    console.log('OPENAPI_URL_MAINNET', OPENAPI_URL_MAINNET);
  };

  return (
    <Layout>
      <Header
        onBack={() => {
          window.history.go(-1);
        }}
        title="API"
      />
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter something..."
                style={{
                  padding: '10px',
                  fontSize: '16px',
                  marginRight: '10px',
                  color: 'black',
                  borderRadius: '5px',
                  border: '1px solid #ccc'
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 20px',
                  fontSize: '16px',
                  borderRadius: '5px',
                  backgroundColor: 'black',
                  border: '1px solid white',
                  color: '#fff',
                  cursor: 'pointer'
                }}>
                {check ? 'Submiting...' : 'Submit'}
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>Default url : {' https://lordinalapi.com'}</p>

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>Backup url : {' https://api.litescribe.io/api'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InputType;
