import React, { useState, useEffect } from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import axios from 'axios'

const GET_POSTS = import.meta.env.VITE_GET_POSTS;

const ViewAllKMap = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get(GET_POSTS)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setPosts(res.data);
                } else {
                    console.warn("API 응답이 배열이 아니므로, 빈 배열로 강제 설정합니다.");
                    setPosts([]); // 배열이 아니면 무조건 빈 배열로 설정
                }
            })
            .catch((err) => {
                console.error("API 호출 중 오류 발생:", err);
                setPosts([]); // 에러 발생 시에도 빈 배열로 설정
                alert("게시물 가져오기 실패");
            })

    }, []); // 마운트 시 1회

    function logpost() {
        console.log(posts);

    }

    const EventMarkerContainer = ({ position, content, approved }) => {
        //const map = useMap()
        const [isVisible, setIsVisible] = useState(false)

        return (
             approved == 'Y' &&(
            <MapMarker
                position={position} // 마커를 표시할 위치

                // onClick={(marker) => map.panTo(marker.getPosition())}
                onMouseOver={() => setIsVisible(true)}
                onMouseOut={() => setIsVisible(false)}
            >
                {isVisible &&
                    (
                        <div style= {{width : '13rem', textAlign: 'center'}}>
                        {content}
                        </div>
                    )
                }

            </MapMarker>
            )
        )
    }

    return (
        <div>
            <Map // 지도를 표시할 Container
                center={{
                    // 지도의 중심좌표
                    lat: 35.16014705470646,
                    lng: 126.85165182860300,
                }}
                style={{
                    // 지도의 크기
                    width: "100%",
                    height: "450px",
                }}
                level={8} // 지도의 확대 레벨
            >
                {posts.map((value) => (
                    <EventMarkerContainer
                        key={`EventMarkerContainer-${value.latitude}-${value.longitude}`}
                        position={{ lat: value.latitude, lng: value.longitude }}
                        content={value.title}
                        approved = {value.approved}
                    />
                ))}
            </Map>

            <button onClick={logpost}></button>
        </div>
    )
}

export default ViewAllKMap;