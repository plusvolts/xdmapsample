var GLOBAL = {
	pointIdx : 0, 				//POINT 인덱스
	lineIdx : 0, 				//LINE 인덱스
	polygonIdx : 0, 			//POLYGON 인덱스 
	Analysis : null, 			//지도 분석기능 API객체
	ghostSymbolmap : null, 		//GHOSTSYBOLMAP API객체
	ghostSymbolLayer : null, 	//GHOSTSYBOL LAYER 객체
	MOVE_PATH : null, 			//애니메이션
	CURRENT_MOVEMENT : null,
	MOUSE_BUTTON_PRESS : false,
	TRACE_TARGET : null,
	RCidx : 0,
	events: {					// 이벤트 핸들러 존재 유무
		selectobject : false,
		selectbuilding : false,
		selectghostsymbol : false,
	},
	VWORLD_API_KEY : 'C8E0F10C-BA8F-31A9-B389-CB316119B6D6'//#실습 브이월드 API 키 입력 필요 //localhost기준으로 발급 필요
};
var Module;

function initUIEvent(){
	
	/**검색 입력칸 엔터이벤트 */
	$('#searchKeyword').on('keypress', function(e){
		if(e.keyCode == 13){
			$('.search button').click();
			$('#searchKeyword').blur();
		}
	});

	//위치 검색 페이지 이동	(동적요소에 .click()이 적용 안되는 오류가 있음)
	$(document).on('click', '.s_paging li',function(e){
		let num = this.innerText;

		if($(this).attr('disabled') == 'disabled'){
			return;
		}

		if(num == '▶'){
			num = Number($('#currnetPage').text())+1;
		}else if(num == '◀'){
			num = Number($('#currnetPage').text())-1;
		}
	
		searchPlace(num);
	});
	
	//위치 검색 결과 클릭 시 좌표 이동
	$(document).on('click', '.s_location li',function(e){
		let camera = Module.getViewCamera();
		camera.setLocation(new Module.JSVector3D(Number(this.dataset.pointx), Number(this.dataset.pointy), 1000));
	})

	//윈도우 크기 자동 적용
	window.onresize = function() {
		if (typeof Module == "object") {
			Module.Resize(window.innerWidth-405, window.innerHeight);
			Module.XDRenderData();
		}
	};

	//메뉴 클릭시 지도 표시 내용 초기화
	$('#right_tab_btn li').click(function(e){

		var layerList = new Module.JSLayerList(true);
		
		if(this.innerText != '검색'){
			$('#tab2 h2').html("");
			$('.s_paging').html('');
			$('.s_location').html('');
			$('#searchKeyword').val('');
			layerList.delLayerAtName("Search_POI");
			$('.firstmenu').click()
	
		}
		if(this.innerText != '인터렉션'){
			layerList.setVisible('POI_Layer', false);
			layerList.setVisible('LINE_Layer', false);
			layerList.setVisible('POLYGON_Layer', false);
		}else{
			layerList.setVisible('POI_Layer', true);
			layerList.setVisible('LINE_Layer', true);
			layerList.setVisible('POLYGON_Layer', true);
		}

		if(this.innerText != '모델객체관리'){
			Module.XDEMapRemoveLayer("facility_build");
			$('.vworldBuilding input[type=checkbox]').attr('checked', false);
			$('#removeAll3Dbtn').click();
			$('.firstmenu').click()
		}
		if(this.innerText != '레이어추가'){
			let servicelayerList = new Module.JSLayerList(false);		
			servicelayerList.delLayerAtName('wmslayer_lt_c_ademd');
			servicelayerList.delLayerAtName('wmslayer_lt_c_upisuq161');
			servicelayerList.delLayerAtName('wmslayer_lt_c_wkmbbsn');

			layerList.delLayerAtName('lt_c_ud801_Layer');
			layerList.delLayerAtName('lt_p_moctnode_Layer');
			$('#d_mapadmin input[type=checkbox]').attr('checked', false);

			
		}
		if(this.innerText != '현실정보'){
			Module.map.stopWeather();//기상효과 종료
			Module.map.clearSnowfallArea();//적설효과 초기화
			Module.map.setSnowfall(0);//적설효과 해제
			Module.map.setFogEnable(false);//안개효과 적용
			$('.firstmenu').click();
			$('#removeDatabtn').click();
			$('#tab5 input[type=checkbox]').attr('checked', false);
		}
		if(this.innerText != '분석'){
			Module.XDEMapRemoveLayer("facility_build");
			Module.XDSetMouseState(1);
			Module.map.clearInputPoint();
			Module.getSlope().clearAnalysisData();
			Module.map.clearSelectObj();
			Module.getUserLayer().removeAll();

			GLOBAL.Analysis.setVFMode(false);					// 가시권 3D 표현 여부 설정
			GLOBAL.Analysis.setVFCreateClickMode(false);	

			$('#tab7 input[type=checkbox]').attr('checked', false);
			$('#tab8 input[type=checkbox]').attr('checked', false);
		}
	})
	
	$('.tabs_4').children('li').eq(1).click(function(e){
		Module.XDSetMouseState(1);
		Module.map.clearInputPoint();
	})
}

// ##실습 1. 기본지도 호출 함수 
function callXDWorldMap(){   
	
/*********************************************************
 * 엔진 파일을 로드합니다.
 * 파일은 asm.js파일, html.mem파일, js 파일 순으로 적용합니다.
 *********************************************************/	

}

/* 엔진 로드 후 실행할 초기화 함수(Module.postRun) */
function initXDMap(){
  
  //초기화시 1회 호출되는 기본 이벤트
  setNavigatorVisible($('#navigator').prop("checked"));	//네비게이터 유무
  validDragSdis();										//드래그 방지
  initUIEvent();										//검색 클릭 이벤트 
}

/**네비게이터 옵션 함수*/
function setNavigatorVisible(val){
	
}

/**지도 외 영역 드래그 방지 함수 */
function validDragSdis() {
	var validDiv = document.getElementById("canvas");

	validDiv.onmouseover = function() {
		Module.XDIsMouseOverDiv(false);
	};

	validDiv.onmouseout = function() {
		Module.XDIsMouseOverDiv(true);
	};
}

//##실습 2. 카메라 이동합수
function moveCamera(){
   
}

//##실습 3. 클릭지점 좌표 이벤트 함수
function setMouseLClickEvent(flag){
	
}


/**
 * ##실습 4. vworld api를 이용한 위치검색 함수 
 *  1) 키워드 위치 검색
 *  2) 검색 목록 별 POINT 생성
 *  3) 페이징 적용
 *  4) 검색 목록 클릭시 해당 위치로 이동
 * */


//vworld 위치 검색 api
function searchPlace(pageNum){

}

//검색 결과 point 배치 함수
function setSearchPOINT(x, y, i){
		
}

//##실습 5. 기본 객체 관리
// 1)기본 객체 생성(포인트, 라인, 폴리곤)
//메뉴 선택 -> 클릭 후 객체 생성 -> 마우스 지도 이동 모드로 자동변경 
//삭제모드 -> 마우스 클릭시 객체 삭제 and 객체 전체 삭제 
function drawInterection(num){
	switch(num){
		case 1 : drawPoint();
			break;
		case 2 : drawLine();
			break;
		case 3 : drawPolygon();
			break;
		case 0 : removeEntity();
			break;
		}
}

//point 생성
function drawPoint(){ 


}

//line 생성
function drawLine(){

}

//line 설정
function createNormalLine(coordinates){
	let data = {
		coordinates: coordinates,
		type: 0,											// 실선 생성 		
		union: false,										// 지형 결합 유무
		depth: false,										// 오브젝트 겹침 유무
		color: new Module.JSColor(255, 255, 0, 0),			// ARGB 설정
		width: 3,											// 선 굵기
	}
	return data;
}

//polygon 생성
function drawPolygon(){


}

//마우스 클릭 삭제모드
function removeEntity(){

}

//기본 객체 전체 삭제 
function removeAllEntity(){


}

//##실습 5. 기본 객체 관리
// 2)기본 분석기능 (거리 측정, 면적 측정)

function measureInteration(val, flag) {
	
}

let m_mercount = 0;	// 측정 오브젝트 갯수
let m_objcount = 0;	// 측정 오브젝트를 표시하는 POI 갯수

/* callBackAddPoint에 지정된 함수 [마우스 왼쪽 클릭 시 이벤트 발생]*/
function addAreaPoint(e) {

}

/* callBackAddPoint에 지정된 함수 [마우스 왼쪽 클릭 시 이벤트 발생]*/
function addDistancePoint(e) {

}

/* callBackCompletePoint에 지정된 함수 [마우스 더블 클릭 시 이벤트 발생]*/
function endPoint(e) {	
	m_mercount++;
}

//=============================================== POI 생성 과정
/* 정보 표시 POI */
function createPOI(_position, _color, _value, _balloonType) {
	// 매개 변수
	// _position : POI 생성 위치
	// _color : drawIcon 구성 색상
	// _value : drawIcon 표시 되는 텍스트
	// _balloonType : drawIcon 표시 되는 모서리 옵션(true : 각진 모서리, false : 둥근 모서리)

}

/* 아이콘 이미지 데이터 반환 */
function drawIcon(_canvas, _color, _value, _balloonType) {

	// 컨텍스트 반환 및 배경 초기화
	var ctx = _canvas.getContext('2d'),
		width = _canvas.width,
		height = _canvas.height
		;
	ctx.clearRect(0, 0, width, height);

	// 배경 Draw Path 설정 후 텍스트 그리기
	if (_balloonType) {
		drawBalloon(ctx, height * 0.5, width, height, 5, height * 0.25, _color);
		setText(ctx, width * 0.5, height * 0.2, _value);
	} else {
		drawRoundRect(ctx, 0, height * 0.3, width, height * 0.25, 5, _color);
		setText(ctx, width * 0.5, height * 0.5, _value);
	}

	return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
}

/* 말풍선 배경 그리기 */
function drawBalloon(ctx,
	marginBottom, width, height,
	barWidth, barHeight,
	color) {

	var wCenter = width * 0.5,
		hCenter = height * 0.5;

	// 말풍선 형태의 Draw Path 설정
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, height - barHeight - marginBottom);
	ctx.lineTo(wCenter - barWidth, height - barHeight - marginBottom);
	ctx.lineTo(wCenter, height - marginBottom);
	ctx.lineTo(wCenter + barWidth, height - barHeight - marginBottom);
	ctx.lineTo(width, height - barHeight - marginBottom);
	ctx.lineTo(width, 0);
	ctx.closePath();

	// 말풍선 그리기
	ctx.fillStyle = color;
	ctx.fill();
}

/* 둥근 사각형 배경 그리기 */
function drawRoundRect(ctx,
	x, y,
	width, height, radius,
	color) {

	if (width < 2 * radius) radius = width * 0.5;
	if (height < 2 * radius) radius = height * 0.5;

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + width, y, x + width, y + height, radius);
	ctx.arcTo(x + width, y + height, x, y + height, radius);
	ctx.arcTo(x, y + height, x, y, radius);
	ctx.arcTo(x, y, x + width, y, radius);
	ctx.closePath();

	// 사각형 그리기
	ctx.fillStyle = color;
	ctx.fill();

	return ctx;
}

/* 텍스트 그리기 */
function setText(_ctx, _posX, _posY, _value) {

	var strText = "";

	// 텍스트 문자열 설정
	var strText = setTextComma(_value.toFixed(2)) + '㎡';

	// 텍스트 스타일 설정
	_ctx.font = "bold 16px sans-serif";
	_ctx.textAlign = "center";
	_ctx.fillStyle = "rgb(0, 0, 0)";

	// 텍스트 그리기
	_ctx.fillText(strText, _posX, _posY);
}

/* 단위 표현 */
function setTextComma(str) {
	str = String(str);
	return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

/* 분석 내용 초기화 */
function clearAnalysis() {


}


//##실습 6. 모델객체 관리 
// 1) vworld 건물 관리 
// 텍스쳐 모드 -> vworld 건물 기본 텍스쳐 or 심플모드 
function addVWorldBuilding(val){
	
}

//vworld 건물 삭제
function removeVWorldBuilding(val){

	
}

//VWORLD 건물 텍스처 모드
function setBuildingTexture(val){

}

//##실습 6. 모델객체 관리
// 2) 파일객체 추가 (고스트심볼 객체를 이용한 3D 모델)
//	3D파일 -> XDdata폴더 
//	객체 추가 시, 해당 위치로 이동
function addModelEntity(val, mName, height){
	
}

/* 고스트 심볼 모델 오브젝트 생성 */
function createGhostSymbol(_objectKey, _modelKey, _position) {
	
}

//모델 객체 전체 삭제
function removeAll3DEntity(){
	
}

/**객체 애니메이션 이벤트시 마우스이벤트 */
let mousedownE = function(e){
	GLOBAL.MOUSE_BUTTON_PRESS = true;
}
let mouseupE = function(e){
	GLOBAL.MOUSE_BUTTON_PRESS = false;
}
let mousemoveE = function(e){
	if (GLOBAL.MOUSE_BUTTON_PRESS) {
		if (e.buttons == 2) {			
			GLOBAL.TRACE_TARGET.direction += (e.movementX*0.1);
			GLOBAL.TRACE_TARGET.tilt += (e.movementY*0.1);
		}
	}

}
let mouseWheelE = function(e){	
	if (e.wheelDelta < 0) {
		GLOBAL.TRACE_TARGET.distance *= 1.1;		
	} else {
		GLOBAL.TRACE_TARGET.distance *= 0.9;
	}
} 


/**## 실습7. 객체이동&이벤트
 * 1)애니메이션 설정 
 * - 비행선 3D 모델 객체 생성
 * - 참고 사이트 -> http://sandbox.dtwincloud.com/code/main.do?id=camera_trace_path_moving
*/
function playCarAnimation(){

}


//애니메이션 멈춤
function stopCarAnimation(){
	
}

/* 이동 실행 */
function move(_index) {
	
}


/* 이동 경로 생성 */
function createPath(_pathPoint) {

}

/**## 실습7. 객체이동&이벤트
 * 2) 마우스로 객체 추가 & 삭제
 * - 마우스 클릭 시 3D 모델 객체 추가& 삭제  
*/
function setMouseRClickEvent(val, id){
	
}

/**## 실습 8. 레이어 추가
 * 1) wms 레이어 추가 
 * 	- vworld wms api 이용 
 *  - 프록시 설정(app.js 파일 참고)
 */
function addWmsLayer(val, layerName){
		
}

/**## 실습 8. 레이어 추가
 * 1) wfs 레이어 추가 
 * 	- vworld wfs api 이용 
 *  - 프록시 설정(app.js 파일 참고)
 */
function addWfsLayer(val, layerName){

}

//wfs polygon 생성
function createWFSPolygon(featuresArr, layer){
	
}

//wfs point 생성
function createWFSPoint(data, layer){

}

/**## 실습 9. 현실 시뮬레이션 
 * 1) 그림자 시뮬레이션 
*/
function addShadowBuilding(val){

}

//그림자 시뮬레이션 시작
function startShadowSimulation(){

}

//그림자 시뮬레이션 멈춤
function stopShadowSimulation(){

}

/**## 실습 9. 현실 시뮬레이션 
 * 1) 날씨 시뮬레이션- 눈효과 적용 
 * 눈 이미지 -> XDdata
*/
function playSnowEffect(){
	
}

/**## 실습 9. 현실 시뮬레이션 
 * 2) 날씨 시뮬레이션 - 비효과 적용 
 * 비 이미지 -> XDdata
*/
function playRainEffect(){
	
}

/**## 실습 9. 현실 시뮬레이션 
 * 3) 날씨 시뮬레이션 - 하늘 밝기
*/
function setSkyBright(val){
	
}

/**## 실습 9. 현실 시뮬레이션 
 * 4) 날씨 시뮬레이션 - 안개
*/
function setFogDensity(val){
	
}

/**## 실습 9. 현실 시뮬레이션 
 * 5) 날씨 시뮬레이션 - 기상효과 제거 
*/
function removeWeatherEntity(){

}

/**실습 10. 통계 표현
 * - 해양 데이터 -> XDdata > data.json
 * - GRID 통계 표현 (2D, 3D)
 */
function createSeriesSetter(type){
	
}

/* 2D 그리드 통계 생성 */
function createGrid_2D(_data) {
	
}

/* 3D 그리드 통계 생성 */
function createGrid_3D(_data){
	
}

/**실습 11. 분석기능
 * - 1) 시곡면 분석 
 */
function addAnalysisBuilding(val){

}

function setMouseAnlaysis(val){
	
}

//시곡면 분석
function getSlopePlane(angle){
	
}

//시곡면 분석 clear
function clearSlopePlane(){
	
}

var vFlag = false;
function viewFireE(e){
	
}

/**실습 11. 분석기능
 * - 2) 가시권 분석
 */
function setViewshadeMode(val){
	
}

//가시권 분석 범위 조절
function setViewOption(val, id){
	
}









