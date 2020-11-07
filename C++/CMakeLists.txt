cmake_minimum_required(VERSION 3.10.0)
project( "gapt" VERSION 0.1.0 LANGUAGES CXX)

#include(CTest)
#enable_testing()


set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)

# for mingw
if(MINGW)
    set(DCMAKE_SH="CMAKE_SH-NOTFOUND")

    # link mingw libraries
    link_directories(./libraries_mingw)
endif()




# init conan
include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
conan_basic_setup()


# set include dir
include_directories(./include)



# add executables
aux_source_directory("./source" SOURCE_FILES) 
add_executable( ${PROJECT_NAME} ${SOURCE_FILES})

# link conan
target_link_libraries(${PROJECT_NAME} ${CONAN_LIBS})



# # add libraries
# aux_source_directory(./src-libs SOURCE_LIBS) 
# add_library(libs ${SOURCE_LIBS} )
# target_link_libraries(${PROJECT_NAME} libs)



# C++ 17
target_compile_features(${PROJECT_NAME} PUBLIC cxx_std_17)




if(WIN32 OR WIN64)
    add_definitions(-Dwindows)
    #SET_TARGET_PROPERTIES(${PROJECT_NAME} PROPERTIES RESOURCES "./icon.res" )
elseif(UNIX AND NOT APPLE)
    set(ADDITIONAL_LIBRARIES "")
endif()