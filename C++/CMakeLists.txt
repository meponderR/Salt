cmake_minimum_required(VERSION 3.10.0)
project( "gapt" VERSION "0.1.1" LANGUAGES CXX)
set("GAPT_VERSION" "Beta 1.1")

#include(CTest)
#enable_testing()


set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)




if(WIN32 OR WIN64 OR APPLE AND NOT MINGW)
# init conan
include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup()
endif()


# set include dir
include_directories(./include)


# add executables
aux_source_directory("./source" SOURCE_FILES) 
add_executable( ${PROJECT_NAME} ${SOURCE_FILES})


# C++ 17
target_compile_features(${PROJECT_NAME} PUBLIC cxx_std_17)

# Set gapt Version
add_definitions(-DGAPT_VERSION="${GAPT_VERSION}")



if(WIN32 OR WIN64 AND NOT MINGW) 
    # link conan
    target_link_libraries(${PROJECT_NAME} ${CONAN_LIBS})
elseif(MINGW)
    target_link_libraries(${PROJECT_NAME} -lcurl)
    set(DCMAKE_SH="CMAKE_SH-NOTFOUND")

elseif(UNIX AND NOT APPLE)
    add_definitions(-Dunix)
    target_link_libraries(${PROJECT_NAME} -lcurl)
elseif(APPLE)
    add_definitions(-Dapple)

    # link conan
    target_link_libraries(${PROJECT_NAME} ${CONAN_LIBS})
endif()