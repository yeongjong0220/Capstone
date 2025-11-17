import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components'; // [디자인] styled-components import

// --- [기능] 기존 로직 (유지) ---
const BACK_WRITE = import.meta.env.VITE_BACK_WRITE;

// 1. 선택지 목록 (배열)
const jobOptions = {
    category: ["IT/소프트웨어", "기획/마케팅", "디자인", "제조/생산", "서비스/고객지원", "미디어", "운전, 배달", "생산, 건설, 노무", "매장관리 및 판매", "외식, 음료", "병원, 간호, 연구", "교육, 강사", "기타"],
    employmentType: ["정규직", "계약직", "인턴", "알바", "프리랜서", "기타"],
    experience: ["신입", "경력 (1년 이상)", "경력 (3년 이상)", "경력 (5년 이상)", "경력 무관"],
    targetAudience: ["청년", "대학생", "경력 단절 여성", "중장년", "고등학생"],
    applyMethod: ["온라인 지원", "이메일 지원", "방문 접수", "우편 접수"],
    status: [
        { value: 'draft', label: '임시저장' },
        { value: 'published', label: '게시하기' }
    ]
};

// --- [디자인] 컴포넌트 이름 변경 (JobPostingForm -> BoardWrite) ---
function BoardWrite() {
    const authContext = useAuth();
    const nav = useNavigate();
    const token = localStorage.getItem('authToken');

    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        content: '',
        job_category: 'IT/소프트웨어',
        employment_type: '정규직',
        required_experience: '신입',
        target_audience: [],
        region: '',
        tags: '',
        apply_start_date: '',
        apply_end_date: '',
        company_name: '', // useEffect에서 설정됨
        source_url: '',
        apply_method: '온라인 지원',
        apply_link: '',
        contact_info: '',
        status: 'draft'
    });

    // [기능] 작성자를 업데이트하기 위한 effect (유지)
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            company_name: authContext.name || '' // authContext.name으로 company_name 설정
        }));
    }, [authContext.name]); // authContext.name이 변경될 때만 실행

    const [attachments, setAttachments] = useState(null);

    // [기능] 값 변경 핸들러 (유지)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // [기능] 체크박스 변경 핸들러 (유지)
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return { ...prev, target_audience: [...prev.target_audience, value] };
            } else {
                return { ...prev, target_audience: prev.target_audience.filter(item => item !== value) };
            }
        });
    };

    // [기능] 폼 제출 핸들러 (유지)
    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            target_audience: formData.target_audience.join(','),
            attachments: "..."
        };

        console.log("서버로 전송할 최종 데이터:", dataToSend);
        
        axios.post(BACK_WRITE, { post: dataToSend, token: token })
            .then((res) => {
                console.log(res);
                alert(`'${dataToSend.title}' 공고가 등록되었습니다.`);
                nav('/board');
            })
            .catch((err) => {
                console.error("공고 등록 실패:", err);
                alert("공고 등록에 실패했습니다.");
            });

        alert(`제목: ${dataToSend.title}, 작성자: ${dataToSend.company_name}로 저장 요청`);
        nav('/board');
    };

    // --- [디자인] 새로운 return 문 (styled-components 적용) ---
    return (
        <FormContainer onSubmit={handleSubmit}>
            <Title>게시판 글쓰기 (공고 등록)</Title>

            {/* 1. 기본 정보 */}
            <FormSection>
                <SectionTitle>기본 정보</SectionTitle>
                <FormGroup>
                    <Label>제목</Label>
                    <StyledInput type="text" name="title" value={formData.title} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                    <Label>요약 (한 줄 설명)</Label>
                    <StyledInput type="text" name="summary" value={formData.summary} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                    <Label>상세 내용</Label>
                    <StyledTextArea name="content" value={formData.content} onChange={handleChange} required rows={10} />
                </FormGroup>
            </FormSection>

            {/* 2. 채용 분류 */}
            <FormSection>
                <SectionTitle>채용 분류</SectionTitle>
                <FormGroup>
                    <Label>직무 분야</Label>
                    <StyledSelect name="job_category" value={formData.job_category} onChange={handleChange}>
                        {jobOptions.category.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </StyledSelect>
                </FormGroup>
                <InputGroup>
                    <FormGroup>
                        <Label>고용 형태</Label>
                        <StyledSelect name="employment_type" value={formData.employment_type} onChange={handleChange}>
                            {jobOptions.employmentType.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </StyledSelect>
                    </FormGroup>
                    <FormGroup>
                        <Label>요구 경력</Label>
                        <StyledSelect name="required_experience" value={formData.required_experience} onChange={handleChange}>
                            {jobOptions.experience.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </StyledSelect>
                    </FormGroup>
                </InputGroup>
                <FormGroup>
                    <Label>대상자</Label>
                    <CheckboxRadioGroup>
                        {jobOptions.targetAudience.map(opt => (
                            <CheckboxLabel key={opt}>
                                <input type="checkbox" value={opt} onChange={handleCheckboxChange} /> {opt}
                            </CheckboxLabel>
                        ))}
                    </CheckboxRadioGroup>
                </FormGroup>
                <InputGroup>
                    <FormGroup>
                        <Label>근무 지역</Label>
                        <StyledInput type="text" name="region" value={formData.region} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>기술 스택/키워드 (쉼표로 구분)</Label>
                        <StyledInput type="text" name="tags" value={formData.tags} onChange={handleChange} />
                    </FormGroup>
                </InputGroup>
            </FormSection>

            {/* 3. 지원 기간 및 출처 */}
            <FormSection>
                <SectionTitle>지원 기간 및 출처</SectionTitle>
                <InputGroup>
                    <FormGroup>
                        <Label>지원 시작일</Label>
                        <StyledInput type="date" name="apply_start_date" value={formData.apply_start_date} onChange={handleChange} required />
                    </FormGroup>
                    <FormGroup>
                        <Label>지원 마감일</Label>
                        <StyledInput type="date" name="apply_end_date" value={formData.apply_end_date} onChange={handleChange} required />
                    </FormGroup>
                </InputGroup>
                <InputGroup>
                    <FormGroup>
                        <Label>회사명</Label>
                        <StyledInput type="text" name="company_name" value={formData.company_name} onChange={handleChange} readOnly />
                    </FormGroup>
                    <FormGroup>
                        <Label>원본 URL</Label>
                        <StyledInput type="url" name="source_url" value={formData.source_url} onChange={handleChange} />
                    </FormGroup>
                </InputGroup>
            </FormSection>

            {/* 4. 지원 방법 및 문의 */}
            <FormSection>
                <SectionTitle>지원 방법 및 문의</SectionTitle>
                <FormGroup>
                    <Label>지원 방법</Label>
                    <StyledSelect name="apply_method" value={formData.apply_method} onChange={handleChange}>
                        {jobOptions.applyMethod.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </StyledSelect>
                </FormGroup>
                <InputGroup>
                    <FormGroup>
                        <Label>지원 링크 (URL)</Label>
                        <StyledInput type="url" name="apply_link" value={formData.apply_link} onChange={handleChange} />
                    </FormGroup>
                    <FormGroup>
                        <Label>문의처 (이메일/전화번호)</Label>
                        <StyledInput type="text" name="contact_info" value={formData.contact_info} onChange={handleChange} />
                    </FormGroup>
                </InputGroup>
            </FormSection>

            {/* 5. 시스템 관리 , 임시 저장, publish를 결정한다만 혹시 나중에 쓰일 가능성이 있으므로 남겨놓음 */}
            <FormSection hidden>
                <SectionTitle>게시 상태</SectionTitle>
                <FormGroup>
                    <CheckboxRadioGroup>
                        {jobOptions.status.map(opt => (
                            <RadioLabel key={opt.value}>
                                <input
                                    type="radio"
                                    name="status"
                                    value={opt.value}
                                    checked={formData.status === opt.value}
                                    onChange={handleChange}
                                /> {opt.label}
                            </RadioLabel>
                        ))}
                    </CheckboxRadioGroup>
                </FormGroup>
            </FormSection>

            <SubmitButton type="submit">공고 등록하기</SubmitButton>
        </FormContainer>
    );
}

// --- [디자인] styled-components 정의 ---
const FormContainer = styled.form`
    max-width: 900px;
    margin: 20px auto;
    padding: 30px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
`;

const Title = styled.h1`
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 30px;
    text-align: center;
`;

const FormSection = styled.div`
    margin-bottom: 30px;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
`;

const SectionTitle = styled.h2`
    font-size: 1.5rem;
    color: #507ea4;
    margin-bottom: 20px;
    padding-bottom: 5px;
    border-bottom: 2px solid #507ea4;
    display: inline-block;
`;

const FormGroup = styled.div`
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    flex: 1; // InputGroup에서 1:1 비율을 갖도록
`;

const InputGroup = styled.div`
    display: flex;
    gap: 20px;
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0;
    }
`;

const Label = styled.label`
    display: block;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 8px;
    font-weight: 500;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-sizing: border-box; /* 패딩 포함 */
    
    &:focus {
        outline: none;
        border-color: #507ea4;
        background-color: #fff;
    }
    
    &[type="date"] {
        color: #555;
    }

    &:read-only {
        background-color: #eee;
        cursor: not-allowed;
    }
`;

const StyledTextArea = styled.textarea`
    width: 100%;
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-sizing: border-box;
    font-family: inherit;
    
    &:focus {
        outline: none;
        border-color: #507ea4;
        background-color: #fff;
    }
`;

const StyledSelect = styled.select`
    width: 100%;
    padding: 12px 15px;
    font-size: 1rem;
    border: 1px solid #ddd;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-sizing: border-box;
    appearance: none;
    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.5%2017.5%200%200%200%200%2086.8c0%205%201.8%209.3%205.4%2013l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2099.8c3.6-3.7%205.4-8%205.4-13%200-5-1.8-9.2-5.4-13z%22%2F%3E%3C%2Fsvg%3E');
    background-repeat: no-repeat;
    background-position: right 15px top 50%;
    background-size: 0.65em auto;

    &:focus {
        outline: none;
        border-color: #507ea4;
        background-color: #fff;
    }
`;

const CheckboxRadioGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #ddd;

    input:checked + & {
        background-color: #e0e8f0;
        border-color: #507ea4;
    }
`;

const RadioLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.95rem;
    color: #333;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ddd;

    input:checked + & {
        background-color: #e0e8f0;
        border-color: #507ea4;
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    padding: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
    background-color: #507ea4;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;

    &:hover {
        background-color: #335169;
    }
`;

export default BoardWrite;