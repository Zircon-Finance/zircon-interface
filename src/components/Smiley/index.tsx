import React from "react";
import { useTheme } from "styled-components";

const Smiley = ({ success }) => {
  const theme = useTheme();
  return (
    <div>
      {theme.darkMode ? (
        success ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_9132_7675)">
              <path
                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                fill="#70BD87"
                fill-opacity="0.15"
              />
              <path
                d="M7.2 14.3984C7.2 14.3984 9 16.7984 12 16.7984C15 16.7984 16.8 14.3984 16.8 14.3984"
                stroke="#70BD87"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.4 8.39844H8.412"
                stroke="#70BD87"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15.6 8.39844H15.612"
                stroke="#70BD87"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_9132_7675">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_9132_7701)">
              <path
                d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
                fill="#E98279"
                fill-opacity="0.15"
              />
              <path
                d="M16.8 16.7984C16.8 16.7984 15 14.3984 12 14.3984C8.99995 14.3984 7.19995 16.7984 7.19995 16.7984"
                stroke="#E98279"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.40002 8.39844H8.41202"
                stroke="#E98279"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M15.6 8.39844H15.612"
                stroke="#E98279"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_9132_7701">
                <rect width="24" height="24" fill="white" />
              </clipPath>
            </defs>
          </svg>
        )
      ) : success ? (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_9132_7623)">
            <path
              d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
              fill="#287438"
              fill-opacity="0.15"
            />
            <path
              d="M7.19995 14.3984C7.19995 14.3984 8.99995 16.7984 12 16.7984C15 16.7984 16.8 14.3984 16.8 14.3984"
              stroke="#287438"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.3999 8.39844H8.4119"
              stroke="#287438"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.6001 8.39844H15.6121"
              stroke="#287438"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_9132_7623">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_9132_7649)">
            <path
              d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
              fill="#D33535"
              fill-opacity="0.15"
            />
            <path
              d="M16.8 16.7984C16.8 16.7984 15 14.3984 12 14.3984C8.99995 14.3984 7.19995 16.7984 7.19995 16.7984"
              stroke="#D33535"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.40002 8.39844H8.41202"
              stroke="#D33535"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.6 8.39844H15.612"
              stroke="#D33535"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_9132_7649">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  );
};

export default Smiley;
