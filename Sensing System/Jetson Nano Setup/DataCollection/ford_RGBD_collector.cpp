// License: Apache 2.0. See LICENSE file in root directory.
// Copyright(c) 2017 Intel Corporation. All Rights Reserved.

#include <librealsense2/rs.hpp> // Include RealSense Cross Platform API
#include <opencv2/opencv.hpp>   // Include OpenCV API
#include <iostream>
#include <string>
#include <fstream>
#include <ctime>
#include <sys/time.h>
#include <time.h>



bool store_depth_images = true;

char depth_image_location[500] = "/home/ei2/DataCollection/RealSense/depth%d/%d.png";
char depth_img_folder_location[500] = "/home/ei2/DataCollection/RealSense/depth%d";

char rgb_image_location[500] = "/home/ei2/DataCollection/RealSense/rgb%d/%d.png";
char rgb_img_folder_location[500] = "/home/ei2/DataCollection/RealSense/rgb%d";

int image_folder_id = 1;
unsigned long image_start_no = 1;
bool log_timestamps_of_images = true;

#define MAX_NUM_IMAGES_IN_FOLDER 10000

std::ofstream timestamp_file; //log file for the timestamps of depth images

using namespace std;

char* create_timestamp() {
    char fmt[64], buf[64];
    struct timeval tv;
    struct tm *tm;
    char *time_str = NULL;

    gettimeofday(&tv, NULL);
    if ((tm = localtime(&tv.tv_sec)) != NULL) {
        strftime(fmt, sizeof fmt, "%Y-%m-%d_%H:%M:%S", tm);
        time_str = new char[strlen(fmt) + 7];
        snprintf(time_str, sizeof(buf), fmt, tv.tv_sec);
        return time_str;
    }
    return NULL;
}


int main(int argc, char * argv[]) try
{
    // Declare depth colorizer for pretty visualization of depth data
    rs2::colorizer colormap;

    // Declare RealSense pipeline, encapsulating the actual device and sensors
    rs2::pipeline pipe;
    // Start streaming with default recommended configuration
    pipe.start();

    using namespace cv;
    const auto window_name_depth = "Depth Image";
    namedWindow(window_name_depth, WINDOW_AUTOSIZE);

     const auto window_name_rgb = "RGB Image";
    namedWindow(window_name_rgb, WINDOW_AUTOSIZE);

    bool first_time_folder_check = true;

    //std::string serial_number(dev.get_info(RS2_CAMERA_INFO_SERIAL_NUMBER));
    std::string serial_number = "s1";

        /* Open the file for logging timestamps of depth images */
    if (log_timestamps_of_images)
    {
        string file_name = "/home/ei2/DataCollection/RealSense/timestamp_" + serial_number + ".log";
        timestamp_file.open(file_name.c_str(), std::ofstream::app); //append   
    }

    //while (waitKey(1) < 0 && cvGetWindowHandle(window_name_depth))
    while (waitKey(1) < 0)
    {
        rs2::frameset data = pipe.wait_for_frames(); // Wait for next set of frames from the camera
        rs2::frame depth_raw = data.get_depth_frame();
        //rs2::frame depth_colormap = color_map(depth_raw);
        rs2::frame depth_colormap = depth_raw.apply_filter(colormap);
        rs2::frame rgb  = data.get_color_frame();


        // Query frame size (width and height)
        const int w1 = depth_colormap.as<rs2::video_frame>().get_width();
        const int h1 = depth_colormap.as<rs2::video_frame>().get_height();

        const int w2 = rgb.as<rs2::video_frame>().get_width();
        const int h2 = rgb.as<rs2::video_frame>().get_height();

        // Create OpenCV matrix of size (w,h) from the colorized depth data and RGB data
        Mat depth_image_colormap(Size(w1, h1), CV_8UC3, (void*)depth_colormap.get_data(), Mat::AUTO_STEP);
        //Mat depth_image_raw(Size(w1, h1), CV_8UC3, (void*)depth_raw.get_data(), Mat::AUTO_STEP);
        Mat depth_image_raw(Size(w1, h1), CV_16UC1, (void*)depth_raw.get_data());
        Mat rgb_image(Size(w2, h2), CV_8UC3, (void*)rgb.get_data(), Mat::AUTO_STEP);
        cv::cvtColor(rgb_image, rgb_image, COLOR_BGR2RGB);

        //Printing the raw depth values
        /*
        for(int i = 0; i < depth_image_raw.rows; i++)
        {
            for(int j = 0; j < depth_image_raw.cols; j++)
            {
                cout << depth_image_raw.at<ushort>(i,j) << " ";
            }
            cout << endl;
        }
        */
        // Update the window with new data
        imshow(window_name_depth, depth_image_colormap);
        imshow(window_name_rgb, rgb_image);

        if(store_depth_images)
        {
            char depth_img_loc_str[1000];
            char rgb_img_loc_str[1000]; 
        
            sprintf(depth_img_loc_str, depth_image_location, image_folder_id, image_start_no);  
            sprintf(rgb_img_loc_str, rgb_image_location, image_folder_id, image_start_no); // #
            
            if(first_time_folder_check) {
                first_time_folder_check = false;
                while(true){
                    //check if the file already exists
                    ifstream f(depth_img_loc_str);
                    if(f.good()) { //the file exists
                        f.close();
                        image_folder_id++;
                        image_start_no=1;

                        sprintf(depth_img_loc_str, depth_image_location, image_folder_id, image_start_no);  
                        sprintf(rgb_img_loc_str, rgb_image_location, image_folder_id, image_start_no); // #
                    } 
                    else {      //the file does not exist - create folder
                        f.close();
                        char depth_img_folder[1000];
                        char rgb_img_folder[1000];

                        sprintf(depth_img_folder, depth_img_folder_location, image_folder_id);
                        sprintf(rgb_img_folder, rgb_img_folder_location, image_folder_id);

                        string depth_cmd("mkdir -p ");
                        depth_cmd += depth_img_folder;
                        //add check
                        int status = system(depth_cmd.c_str()); 
            
                        string rgb_cmd("mkdir -p ");
                        rgb_cmd += rgb_img_folder;
                        status = system(rgb_cmd.c_str());
                        break;
                    }                       
                }
            }
            
            //Saving depth images
            cout <<"Depth image loc1: " << depth_img_loc_str << endl;
            bool save_status = cv::imwrite(depth_img_loc_str,depth_image_raw);

            cout <<"RGB image loc: " << rgb_img_loc_str << endl;
            //cv::imwrite(rgb_img_loc_str, rgb_image); // #
            cv::imwrite(rgb_img_loc_str, rgb_image); // #
            printf("Storing image: %5lu (in folder %3d)\n", image_start_no, image_folder_id); // #
            if (save_status == false) {
                cout << "Failed to save image: " << image_start_no << endl;
                image_start_no = 0;
                image_folder_id++;
                char depth_img_folder[500];
                char rgb_img_folder[500];

                sprintf(depth_img_folder, depth_img_folder_location, image_folder_id);
                sprintf(rgb_img_folder, rgb_img_folder_location, image_folder_id);
                //sprintf(depth_img_folder, depth_img_folder_location, image_folder_id);
                //sprintf(rgb_img_folder, rgb_img_folder_location, image_folder_id);

                string depth_cmd("mkdir -p ");
                depth_cmd += depth_img_folder;
                //add check
                int status = system(depth_cmd.c_str()); 
            
                string rgb_cmd("mkdir -p ");
                rgb_cmd += rgb_img_folder;
                status = system(rgb_cmd.c_str());
            }
            else {
                if((image_start_no % 100) == 0)
                    cout << "Saved image: " << image_folder_id << " " << image_start_no << endl;
                    
                if(log_timestamps_of_images) {
                    const char *timestamp = create_timestamp();
                    timestamp_file << timestamp << " " << image_folder_id << " " << image_start_no << "\n"; 
                    delete[] timestamp;
                    timestamp_file.close();
                    string file_name = "/home/ei2/DataCollection/RealSense/timestamp_" + serial_number + ".log";
                    timestamp_file.open(file_name.c_str(), std::ofstream::app); //append
                    //if(image_start_no % 300 == 0)
                    //    timestamp_file.flush();
                }

            }
            image_start_no++;
            if(image_start_no > MAX_NUM_IMAGES_IN_FOLDER) {
                image_start_no = 1;
                image_folder_id++;
                char depth_img_folder[500];
                char rgb_img_folder[500];

                sprintf(depth_img_folder, depth_img_folder_location, image_folder_id);
                sprintf(rgb_img_folder, rgb_img_folder_location, image_folder_id);
                //sprintf(depth_img_folder, depth_img_folder_location, image_folder_id);
                //sprintf(rgb_img_folder, rgb_img_folder_location, image_folder_id);

                string depth_cmd("mkdir -p ");
                depth_cmd += depth_img_folder;
                int status = system(depth_cmd.c_str()); 
                //add check
            
                string rgb_cmd("mkdir -p ");
                rgb_cmd += rgb_img_folder;
                status = system(rgb_cmd.c_str());
            }
        }       


    }

    if(log_timestamps_of_images)
        timestamp_file.close();


    return EXIT_SUCCESS;
}
catch (const rs2::error & e)
{
    std::cerr << "RealSense error calling " << e.get_failed_function() << "(" << e.get_failed_args() << "):\n    " << e.what() << std::endl;
    return EXIT_FAILURE;
}
catch (const std::exception& e)
{
    std::cerr << e.what() << std::endl;
    return EXIT_FAILURE;
}



