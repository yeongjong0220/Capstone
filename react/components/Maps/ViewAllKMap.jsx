import React, { useState, useEffect } from 'react';
import { Map, MapMarker, Polyline } from 'react-kakao-maps-sdk'
import axios from 'axios'

const GET_POSTS = import.meta.env.VITE_GET_POSTS;
const KAKAO_REST_API = import.meta.env.VITE_KAKAO_REST_API;

const startImage = {
    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png",
    size: [50, 45],
    options: {
        offset: [15, 43],
        // spriteSize: [0, 0],  // 
        spriteOrigin: { x: 13, y: 43 } // 스프라이트의 좌상단 위치
    },
}

const startDragImage = {
    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_drag.png",
    size: [50, 64],
    options: {
        offset: [15, 54],
        spriteOrigin: { x: 13, y: 60 } // 스프라이트의 좌상단 위치
    },
}

const endImage = {
    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png",
    size: [50, 45],
    options: {
        offset: [25, 45], // 마커의 좌표에 일치시킬 이미지 안의 좌표 (기본값: 이미지의 가운데 아래)
        spriteOrigin: { x: 0, y: 0 } // 스프라이트의 좌상단 위치
    },
}

const defaultmarkImage =
{
    src: "http://t1.daumcdn.net/mapjsapi/images/marker.png",
    size: [29, 42],
    options: {
        offset: [14, 42],
        spriteOrigin: { x: 14, y: 42 } // 스프라이트의 좌상단 위치
    },
}



const ViewAllKMap = () => {
    const [posts, setPosts] = useState([]);
    const [state, setState] = useState({
        center: {  // gps로 측정한 내 현재 위치
            lat: 33.450701,
            lng: 126.570667,
        },
        errMsg: null,
        isLoading: true,
    })
    const [sPosition, setSPosition] = useState(null); // 출발지 좌표를 저장
    const [dPosition, setDPosition] = useState(null); // 도착지 좌표를 저장

    const [start, setStart] = useState(startImage); // 출발지 이미지를 바꿀 수 있도록 하는 State 변수
    const [end, setEnd] = useState(endImage); // 출발지 이미지를 바꿀 수 있도록 하는 State 변수

    // 클릭된 마커를 기록함
    const [selectedMarker, setSeletedMarker] = useState();

    // 경로를 나타내는 리스트
    const [path, setPath] = useState([]);


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

        // 사용자의 위치를 가져와서 세팅하는 역할
        if (navigator.geolocation) {
            // GeoLocation을 이용해서 접속 위치를 얻어오기
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setState((prev) => ({
                        ...prev,
                        center: {
                            lat: position.coords.latitude, // 위도
                            lng: position.coords.longitude, // 경도
                        },
                        isLoading: false,
                    }))

                    // 출발지를 gps 기준으로 미리 정함
                    setSPosition({
                        lat: position.coords.latitude, // 위도
                        lng: position.coords.longitude, // 경도}
                    });
                },
                (err) => {
                    setState((prev) => ({
                        ...prev,
                        errMsg: err.message,
                        isLoading: false,
                    }))
                }
            )
        } else {
            // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용 설정
            setState((prev) => ({
                ...prev,
                errMsg: "geolocation을 사용할수 없어요..",
                isLoading: false,
            }))
        }
    }, []); // 마운트 시 1회

    function logpost() {
        console.log(posts);

    }

    async function getCarDirection() {
        // 호출방식의 URL을 입력
        const url = 'https://apis-navi.kakaomobility.com/v1/directions';

        // 출발지(origin), 목적지(destination)의 좌표를 문자열로 변환
        const origin = `${sPosition.lng},${sPosition.lat}`;
        const destination = `${dPosition.lng},${dPosition.lat}`;

        // 요청 헤더를 추가
        const headers = {
            Authorization: `KakaoAK ${KAKAO_REST_API}`,
            'Content-Type': 'application/json'
        };

        // 표3의 요청 파라미터에 필수값을 적기
        const queryParams = new URLSearchParams({
            origin: origin,
            destination: destination
        });

        const requestUrl = `${url}?${queryParams}`; // 파라미터까지 포함된 전체 URL

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            console.log(data)
            const linePath = [];
            data.routes[0].sections[0].roads.forEach(router => {
                router.vertexes.forEach((vertex, index) => {
                    if (index % 2 === 0) {
                        linePath.push({lat : router.vertexes[index + 1], lng : router.vertexes[index]});
                    }
                });
            });
            setPath(linePath);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const EventMarkerContainer = ({ position, content, onClick, approved, isClicked }) => {
        //const map = useMap()
        const [isVisible, setIsVisible] = useState(false)

        return (
            approved == 'Y' && (
                <MapMarker
                    position={position} // 마커를 표시할 위치
                    onMouseOver={() => setIsVisible(true)}
                    onMouseOut={() => setIsVisible(false)}
                    onClick={onClick}
                >
                    {isVisible &&
                        (
                            <div style={{ width: '13rem', textAlign: 'center' }}>
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
                center={state.center}
                style={{
                    // 지도의 크기
                    width: "100%",
                    height: "700px",
                }}
                level={8} // 지도의 확대 레벨

                onClick={(_, mouseEvent) => { // 클릭한 위치의 좌표 가져오기
                    const latlng = mouseEvent.latLng
                    const clickedPosition = {
                        lat: latlng.getLat(),
                        lng: latlng.getLng(),
                    }
                    setSPosition(clickedPosition);
                    console.log(clickedPosition);

                }}

            >
                {posts.map((value, index) => (
                    <EventMarkerContainer
                        index={index}
                        key={`EventMarkerContainer-${value.latitude}-${value.longitude}`}
                        position={{ lat: value.latitude, lng: value.longitude }}
                        content={value.title}
                        approved={value.approved}
                        onClick={(marker) => {
                            setSeletedMarker(index);
                            console.log(index);
                            const latlng = marker.getPosition();
                            const newPosition = {
                                lat: latlng.getLat(),
                                lng: latlng.getLng(),
                            };
                            setDPosition(newPosition);
                        }}

                        isClicked={selectedMarker === index}

                    />
                ))}

                {/* 맵에서 클릭하면.. 마커 위치가 뜨도록.. */}
                {sPosition && <MapMarker position={sPosition ?? null}
                    image={start}
                    draggable={true} // 마커를 클릭했을 때 지도의 클릭 이벤트가 발생하지 않도록 설정합니다
                    onDragStart={() => setStart(startDragImage)} // 마커가 이동하면 이미지를 변경합니다
                    onDragEnd={(marker) => {
                        setStart(startImage)
                        const latlng = marker.getPosition();
                        const newPosition = {
                            lat: latlng.getLat(),
                            lng: latlng.getLng(),
                        };
                        setSPosition(newPosition);
                        console.log(sPosition);
                    }} // 마커가 이동하면 이미지를 변경합니다
                />}
                <Polyline
                    path={path}
                    strokeWeight={5} // 선의 두께 입니다
                    strokeColor={"#fd0202ff"} // 선의 색깔입니다
                    strokeOpacity={0.8} // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                    strokeStyle={"solid"} // 선의 스타일입니다
                />
            </Map>
            <button onClick={getCarDirection}>길찾기</button>
        </div>
    )
}

export default ViewAllKMap;